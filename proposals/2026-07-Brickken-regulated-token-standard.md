# Development Fund Proposal

## Regulated Token Standard

| Field | Value |
| :---- | :---- |
| Authors | Thamer DRIDI <thamer@brickken.com><br>Nabil El Alami Khalifi <nabil@brickken.com> |
| Org | Brickken |
| Status | Draft |
| Created | 2026-07-22 |
| Label | token-asset-standards |
| [Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md) | need Champion |

---

## Abstract

The Regulated Token Standard proposes a regulated fungible token standard for the Canton Network that extends CIP-0112 with compliance controls required for Real World Asset (RWA) tokenization. The standard defines two minimal interfaces: per-holder freeze enforcement and jurisdictional whitelist control, both enforced through DAML's structural access control.

This CIP requests funding to define the specification, develop the reference implementation, conduct a security audit, and release a focused integration SDK with developer tools as a public good for the Canton ecosystem.

## Motivation

Canton's Token Standard (CIP-0112) provides excellent primitives for fungible token transfer, minting, and burning. It is the canonical standard, and it works. But it was designed for general-purpose token infrastructure: one where compliance is an application-layer concern. RWA tokenization lives in a regulated world, and in a regulated world certain capabilities are non-negotiable.

A global pause flag is insufficient for regulatory enforcement. Regulators do not want to shut down the entire token; they need to freeze specific holders. An OFAC sanctions list match requires freezing one holder, not all. KYC expiration affects one holder, not the entire token. A regulatory order targets one holder's balance, not all. CIP-0112 alone would leave RWA issuers without the regulatory tools they need, forcing them to build compliance as an external layer through off-chain checks and manual enforcement: fragile, auditable-only, and non-enforceable at the protocol level.

Every issuer building on Canton today implements their own freeze mechanisms and whitelist logic from scratch. This is inefficient, risky, and fragmented. Separate issuers build freeze mechanisms with different semantics. Multiple teams implement jurisdictional whitelists that wallets cannot support uniformly. The result is not just duplicated effort: it is divergent implementations that create compliance gaps regulators will not accept and security surface area that multiplies with each new project.

As Canton grows, establishing these patterns now is critical before the next million users are onboarded. Retrofitting compliance standards after mass adoption creates friction, migration costs, and potential regulatory exposure. The proposed standard provides the foundation for regulated asset issuance that scales with the network.

The proposal addresses both fragmentation and scale by introducing a shared compliance layer. We seek to define it as a formal Canton standard, harden it through security audit, and deliver it as open-source reference implementations and an integration SDK. No single issuer should have to reinvent these controls.

## Why This Matters Now

**Immediate Pain Point:** RWA issuers on Canton are currently building custom compliance layers. This is duplicated effort across the ecosystem, creating security risks and fragmentation. The proposed standard provides a shared, audited solution.

**Architectural Fit:** The proposed standard is designed as a narrow extension to CIP-0112. It does not require changes to the core token standard. It leverages DAML's structural access control (signatory/controller/observer) for compile-time enforcement, not runtime checks.

**Market Timing:** The RWA tokenization market is growing. Canton needs a regulated token standard now to capture institutional interest. The proposed standard fills this gap without waiting for a full version 3 of the base token standard.

**Developer Experience:** A lean, well-scoped SDK reduces integration time from months to weeks, enabling faster adoption by wallet providers, exchanges, and app developers.

## Specification Outline

The proposal is scoped narrowly: two compliance extensions on the base CIP-0112 fungible token. The specification will define the following interfaces and their invariants.

**Freezable:** Per-holder freeze enforcement. The issuer can toggle freeze state on any holder's tokens. A frozen holding cannot be transferred. Freezing one holder does not affect others; this is granular, unlike a global pause. The interface covers regulatory freeze orders, KYC/KYB expiration, suspicious activity flags, and sanctions list matches.

**Whitelistable:** Send and receive whitelist enforcement. The issuer sets per-holder lists of counterparties a holder may send to or receive from. Empty whitelist means open to all; non-empty is restrictive. This covers jurisdictional restrictions, accredited investor verification, and counterparty risk management. The whitelists are designed to work with the CIP-0112 Account structure for multi-tier custodial visibility.

**Mintable and Burnable:** Supply cap enforcement at the template level. Mint checks the cap before proceeding. Burn updates the registry. Both are issuer-controlled.

The specification will also define read-only compliance views (send/receive eligibility, transfer permissibility, and frozen amount) for wallet and DeFi integration.

The specification will also define the compliance-relevant EventLog event types emitted by regulated tokens implementing the standard, and the backwards compatibility guarantees CIP-0112 compliance.

## Scope of Work

The grant funds the following deliverables:

1. **CIP specification document.** A formal standards-track CIP specification submitted to `canton-foundation/cips` following the CIP process, defining the interfaces above, their invariants, and their compatibility with CIP-0112.

2. **Reference implementation.** DAML templates implementing the proposed interfaces, with unit tests covering all compliance invariants. The implementation is open-source under Apache-2.0.

3. **Security audit.** Third-party audit of the reference implementation. All findings resolved before milestone acceptance.

4. **Conformance suite.** An automated test suite that any token implementation can run to verify compliance with the proposed standard.

5. **Integration SDK (core).** A focused open-source client library with documentation, covering the highest-value integrations: wallet balance/transfer adapters and compliance status queries.

6. **Real-client integrations.** Direct engineering support for >=2 active RWA issuers to integrate tokens implementing the proposed standard on Canton production/testnet, validating the standard against live asset tokenization workloads.

## Backwards Compatibility

The proposed standard is designed to be fully compatible with CIP-0112 at the protocol level. The compliance extensions (Freezable, Whitelistable) are opt-in features that issuers enable on a per-token basis. Tokens that do not enable these extensions are fully compatible with all CIP-0112 wallets and tools. Tokens that enable compliance features will require wallet awareness of the extended interfaces for full functionality, but basic balance display and transfer operations remain accessible through the core CIP-0112 API.

## Grant Request

This CIP requests funding from the Canton Development Fund to develop the Regulated Token Standard as a public good. The deliverables are a formal specification, a reference implementation, a security audit, a conformance suite, a focused integration SDK, and direct engineering support for 2+ real-client integrations. All output is open-source and freely adoptable by any party on the Canton Network.

### Milestones

| # | Milestone | Timeline | Deliverables | Payment |
|---|-----------|----------|-------------|---------|
| Setup | Project Setup & Bootstrap | Month 1 | Project initialization, development environment setup, initial spec draft, identification of pilot issuer partners | 350,000 CC |
| M1 | CIP Specification & Reference Implementation | Months 2–4 | Regulated Token Standard specification PR merged to `canton-foundation/cips` as Draft, DAML reference implementation with unit tests, conformance suite v1 runnable | 860,000 CC |
| M2 | Security Audit & SDK Core Phase 1 | Months 5–8 | Third-party security audit report (critical/high resolved), SDK core module Phase 1 (wallet adapter foundation), first real-client integration live on testnet | 1,285,000 CC |
| M3 | SDK Completion & CLI Delivery | Months 9–12 | SDK core Phase 2, compliance CLI tooling, remaining real-client integrations live with tokenized assets on Canton | 1,920,000 CC |
| M4 | Ecosystem Adoption & Maintenance Handoff | Months 13–15 | 2+ real clients with tokenized assets live on production/testnet, the proposed CIP advances to Proposed status, maintenance plan published with transition to 2026-Maintenance Grant for Daml Open Source | 970,000 CC |
| Bonus | Performance Incentive | M4 completion | +300,000 CC if 3+ independent real-client integrations with tokenized assets are live before Month 14 | Up to 300,000 CC |

### Funding

**Total requested:** 5,385,000 CC paid per milestone acceptance.

| Category | CC Amount | % of Total |
|---|---|---|
| Project setup & bootstrap (Setup) | 350,000 | 6.5% |
| CIP specification & reference implementation (M1) | 860,000 | 16.0% |
| Security audit (third-party) (M2) | 785,000 | 14.6% |
| SDK development & documentation, core (M2/M3) | 1,050,000 | 19.5% |
| Compliance CLI tooling (M3) | 270,000 | 5.0% |
| Real-client integrations: 2 active RWA issuers (M2–M4) | 965,000 | 17.9% |
| Conformance suite (M1) | 605,000 | 11.2% |
| Ecosystem adoption & maintenance handoff (M4) | 500,000 | 9.3% |
| **Total** | **5,385,000** | **100%** |

**Budget Rationale:** The SDK core is the largest single investment (19.5%) but is tightly scoped to compliance query functionality. The compliance CLI is a focused, high-value tool for issuers and regulators. The conformance suite (11.2%) is to ensure robust, automated compliance verification across the ecosystem. Real-client integrations (17.9%) validate the standard against production workloads and the audit budget (14.6%) addresses institutional trust requirements.

**Financial Protocols on Acceleration/Delay:**

- **Acceleration Bonus:** +300,000 CC if M4 deliverables are completed before Month 14 with 3+ verified real-client integrations with tokenized assets live.
- **SLA Penalties:** If M4 (CIP ratification + 2 live integrations) is delayed beyond Month 15 due to delivery issues, a 10% haircut applies to the M4 payout (97,000 CC reduction). Delays caused by Foundation governance timeline are exempt.
- **Standard Penalty:** For all other milestones, a 10% reduction of the milestone payout applies if delivered >30 days past the stated target date.

**Volatility Stipulation:**

This proposal is denominated in Canton Coin. Since the project spans less than 18 months, there is no rebasing on CC price changes. Payments are made in fixed CC amounts per milestone acceptance regardless of price movement.

**Risk Allocation:**

Brickken explicitly assumes the financial risk of executing engineering phases in parallel to the CIP approval process. Should the governance discussion amend or reject the proposed CIP, Brickken absorbs the wasted work without requesting supplemental Foundation funds. Brickken will make commercially reasonable efforts to include scope changes under the current milestone deliverables and timelines.

**Maintenance Handoff:**

This proposal does not request funding for ongoing operational maintenance. Upon successful completion of M1, day-to-day maintenance of the Regulated Token Standard reference implementation (security patches, bug fixes, CI/CD management, external PR reviews) will transition to the *2026-Maintenance Grant for Daml Open Source*. Breaking changes require new CIP submission and voting. Bug fixes and non-breaking improvements follow standard PR process.

### Acceptance Criteria & SLOs

| Milestone | Primary Acceptance Signal | SLO |
|---|---|---|
| **Setup** | Development environment ready + initial spec draft submitted | Repo initialized, dev docs published |
| **M1** | Spec PR merged to cips repo + reference implementation compiles + tests passing + conformance suite v1 runnable | All unit tests pass with >90% code coverage |
| **M2** | Audit report published (critical/high resolved) + SDK core module released | Zero critical/high findings open; SDK core documented |
| **M3** | SDK v1.0 released + CLI tooling | All SDK modules documented; CLI passes compliance checks |
| **M4** | 2+ real clients with tokenized assets live on production + CIP advances to Proposed status + maintenance handoff plan published | ≥2 issuers with live tokenized assets; CIP status updated to Proposed; maintenance plan published |

**Service Level Objectives:**

- **Critical Security Vulnerabilities:** Patch or mitigation plan within 48 hours of discovery (post-M2).
- **Community PRs:** Reviewed within 10 business days (via maintenance grant transition).
- **Documentation:** Updated within 5 business days of any breaking change.

### Adoption Validation

The Regulated Token Standard is not designed in a vacuum. The grant funds direct engineering collaboration with 2+ active RWA issuers who are tokenizing real assets on Canton. These integrations will inform specification refinements during M2–M3, ensuring the standard reflects actual issuer requirements rather than theoretical use cases. Lessons learned feed back into the SDK and conformance suite.

## References

- [CIP-0000: CIP Process](https://github.com/canton-foundation/cips/blob/main/cip-0000/cip-0000.md)
- [CIP-0056: Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0082: Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100: Governance of the CIP-0082 Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP-0112: Token Standard V2](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [MiFID II](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014L0065)
- [FINMA Tokenization Guidelines](https://www.finma.ch)
- [SEC Regulation D](https://www.sec.gov)
- [Canton Documentation](https://docs.canton.network/)

## Copyright

Copyright of this CIP is waived, and the subject matter is dedicated to the public under the [CC0-1.0 Universal License](https://creativecommons.org/publicdomain/zero/1.0/).
Code in the reference implementation is licensed under [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).
