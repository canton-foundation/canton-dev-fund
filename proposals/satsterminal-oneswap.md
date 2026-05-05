## Development Fund Proposal

### OneSwap: Open Liquidity Infrastructure and Developer SDK for Canton

**Author:** Sats Terminal  
**Status:** Submitted  
**Created:** 2026-02-24  
**Label:** defi-liquidity  
**Champion:** need Champion

---

## Abstract
OneSwap is already live on Canton MainNet as a swap DEX with a public web app, liquidity provisioning flows, operational tooling, analytics, and a public TypeScript SDK. This proposal requests Development Fund support to turn that live system into a stronger shared liquidity primitive for the Canton ecosystem.

The requested funding covers two tightly linked needs. First, OneSwap needs production hardening, clearer developer onboarding, and better public analytics so third-party teams can rely on it as reusable infrastructure rather than a standalone application. Second, the core pools need additional liquidity capitalization so slippage remains low enough for real user flow and SDK-driven integrations. Without deeper pool depth, the product can be technically live while still failing to deliver acceptable execution quality for meaningful order sizes.

---

## Specification

### 1. Objective
The objective is to provide Canton with open, developer-grade liquidity infrastructure so applications that need token conversion or swap execution do not each have to build custom transfer orchestration, sender attribution, refund handling, traffic-cost estimation, reserve tracking, and recovery tooling from scratch.

OneSwap is intended to solve that structural gap by offering:

- a live Canton-native swap DEX for end users
- liquidity provisioning on shared pools
- a reusable SDK and developer surface for third-party integrations

The intended outcome of this grant phase is a production-ready shared liquidity layer with stronger runtime reliability, deeper core pool liquidity, clearer developer onboarding, and public analytics that make adoption and review straightforward.

### 2. Implementation Mechanics
OneSwap is built as a Canton-native swap DEX and integration surface. Users request a quote, create a swap intent, and send funds from their own Canton wallet to the pool address presented by OneSwap. Once the deposit is detected, OneSwap applies pricing and fee logic, completes settlement back to the user's wallet, and exposes tracking through completion. Quotes are traffic-aware and fail closed when slippage, liquidity, or minimum-amount checks are not satisfied.

The live product currently supports the `CC/USDCx` and `CC/cBTC` pools on MainNet. It also supports website-based liquidity add and withdrawal flows, pool statistics such as APR, TVL, and volume, a public TypeScript SDK, wallet-authenticated developer sessions, API key management, and swap tracking.

The funded implementation scope is focused on concrete next-step work:

- harden the production runtime around reserve snapshots, deposit handling, fee accounting, recovery tooling, and operator runbooks
- deepen the `CC/USDCx` and `CC/cBTC` pools so representative trade sizes can clear with materially better slippage
- maintain and improve the public SDK for wallet-authenticated quoting, swap creation, and tracking on mainnet and devnet
- publish clearer documentation, example integrations, and analytics/reporting for ecosystem reviewers and external builders

The following items remain valid roadmap work but are not hard acceptance gates for this grant phase:

- LP management inside the public SDK
- multi-hop routing
- broader pool onboarding flows
- multi-language SDK support beyond TypeScript

### 3. Architectural Alignment
This work aligns with Canton architecture by building on Canton-native wallet interactions, party-scoped settlement flows, token transfer paths, and operational realities under Canton's privacy model. The hard parts of the problem are not generic frontend concerns; they involve safe deposit detection, sender attribution, refund behavior, reserve reconciliation, and settlement orchestration in a Canton environment.

The proposal also aligns with ecosystem priorities by creating a reusable primitive instead of another closed application. A public SDK, documented wallet-authenticated flows, transparent pool metrics, and deeper shared liquidity create leverage for other Canton builders who need swap functionality without re-implementing the same infrastructure.

No protocol-level changes or new CIP dependencies are required for this grant phase. The work packages existing Canton-native patterns into a more reliable and more reusable ecosystem service.

### 4. Backward Compatibility
*No backward compatibility impact.*

The grant phase strengthens and extends an already live system. Existing users and integrations should benefit from deeper liquidity, better runtime reliability, and clearer documentation without requiring breaking changes to Canton itself.

---

## Milestones and Deliverables

### Milestone 1: Production Hardening and Core Pool Depth
- **Estimated Delivery:** Weeks 1-4 after project kickoff  
- **Focus:** Strengthen the live MainNet runtime and improve execution quality on the core markets  
- **Deliverables / Value Metrics:** Stable production runtime with reserve/accounting state in sync; operator runbooks and recovery tooling tightened; reserve depth snapshots and representative slippage tables published for `CC/USDCx` and `CC/cBTC`; initial grant-funded liquidity deployed into the core pools to reduce price impact on representative trade sizes

### Milestone 2: Developer SDK Hardening and Integration Path
- **Estimated Delivery:** Weeks 5-8 after project kickoff  
- **Focus:** Make OneSwap usable as real third-party infrastructure rather than a nominal SDK surface  
- **Deliverables / Value Metrics:** Production-grade `@oneswap/sdk` release maintained on npm; clean mainnet and devnet targeting; documented wallet-authenticated swap flows, typed errors, and wallet-scoped tracking; example integration application and onboarding materials that let an external developer complete an end-to-end swap integration

### Milestone 3: Analytics, Transparency, and Ecosystem Packaging
- **Estimated Delivery:** Weeks 9-12 after project kickoff  
- **Focus:** Make OneSwap legible as public ecosystem infrastructure for review and adoption  
- **Deliverables / Value Metrics:** Pool metrics such as reserve depth, TVL, APR, volume, and fee activity exposed through the product and/or documented APIs; before-and-after slippage reporting for the core pools; architecture and usage documentation published; reference integration material packaged for ecosystem builders

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- MainNet runtime health confirmed across backend, ledger ingest, maintenance, and settlement paths with reserve/accounting state in sync
- Reserve depth snapshots and representative slippage tables published for `CC/USDCx` and `CC/cBTC`
- A defined portion of grant-funded capital visibly deployed to the core pools as productive liquidity depth
- Website swap, LP add, LP withdrawal, and tracking flows functional in production
- `@oneswap/sdk` published, documented, and usable for wallet-authenticated quoting, swap creation, and tracking on both mainnet and devnet
- A developer able to obtain keys, complete wallet authentication, and execute a documented end-to-end integration flow
- APR, TVL, volume, and related pool metrics exposed through a documented product or API surface

Multi-hop routing and multi-language SDK expansion remain valid future roadmap items, but they are not immediate pass/fail blockers for this grant phase.

---

## Funding

**Total Funding Request:** 600,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Production Hardening and Core Pool Depth)_: 200,000 CC upon committee acceptance
- Milestone 2 _(Developer SDK Hardening and Integration Path)_: 200,000 CC upon committee acceptance
- Milestone 3 _(Analytics, Transparency, and Ecosystem Packaging)_: 200,000 CC upon final release and acceptance

### Use of Funds
- 350,000 CC for runtime hardening, SDK maintenance and release work, developer onboarding, example applications, analytics, reporting, documentation, and operational tooling
- 250,000 CC for liquidity capitalization of `CC/USDCx` and `CC/cBTC` to improve execution quality and reduce slippage on representative trade sizes

### Volatility Stipulation
The project duration is under 6 months.

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for major OneSwap milestone completions and infrastructure releases
- Case studies or technical blog posts explaining Canton-native AMM design, wallet flows, and integration patterns
- Developer and ecosystem promotion through SDK tutorials, reference integrations, and participation in relevant Canton ecosystem discussions

---

## Motivation
This proposal is valuable because Canton needs shared liquidity infrastructure, not only isolated applications with bespoke swap logic. Without a common developer-grade liquidity primitive, every application that needs token conversion or access to shared pools has to recreate the same operational and settlement machinery.

OneSwap already demonstrates that this category can work on Canton MainNet. Funding the next phase increases the ecosystem value of that work by improving reliability, making integrations easier for other builders, and ensuring the core pools are deep enough to support meaningful user flow. That combination supports adoption, reduces duplicated engineering effort across the ecosystem, and makes liquidity access more composable for future Canton applications.

---

## Rationale
This is the right approach because the core infrastructure already exists in production. OneSwap is not a greenfield concept; it is a live system with MainNet swap support, website-based liquidity flows, a published SDK, developer API key management, swap tracking, and Featured App approval. The proposal therefore funds the highest-leverage next step: hardening, packaging, and capitalizing a working system rather than funding speculative initial construction.

Sats Terminal is also well positioned to deliver this scope because the remaining work requires domain-specific operational knowledge. Safe pool-based settlement, reserve reconciliation, traffic-aware quoting, wallet-authenticated flows, and recovery after partial failures are already part of the implemented runtime. Continuing with the team that built and operates those paths reduces execution risk and increases the odds that OneSwap becomes reliable shared liquidity infrastructure for the broader Canton ecosystem.
