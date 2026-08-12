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

The Regulated Token Standard proposes a regulated fungible token standard for the Canton Network that extends CIP-0112 with the compliance controls required for Real World Asset (RWA) tokenization. It takes ERC-7943 (uRWA), a Final Standards Track ERC co-authored at Brickken, as its starting point for which compliance controls a regulated token needs, and derives the mechanisms from Canton's own authorisation and privacy model.

The outline below names the artifacts the reference design uses. The substantive ones: `RegistryAuthority` carries the holder's standing authorisation for issuer-initiated actions; `TransactPermission` carries the issuer's revocable per-account eligibility determination; `TransferApproval` carries a per-transfer determination where pairwise counterparty rules apply; `FreezeState` carries the authoritative frozen amount for a holder; `InstrumentConfig` carries instrument-level declarations. `InstrumentSupply`, role grants and `ApprovalVote` complete the authorisation plumbing, and `RegulatedHoldingView` is the wallet-facing read interface. The standard also specifies normative freeze semantics over the existing `Holding` lock, an issuer-initiated transfer procedure, and defined behaviour across the transfer and settlement paths.

Enforcement derives from the instrument admin's authority being required on every transfer. That authority reaches a holder-submitted transaction by delegation through admin-signed contracts, and the guards it gates are re-executed by every validating participant at transaction validation.

This proposal requests funding to define the specification, develop the reference implementation, conduct a security audit, and release a focused integration SDK with developer tools as a public good for the Canton ecosystem.

## Motivation

Canton's Token Standard (CIP-0112) provides excellent primitives for fungible token transfer, minting, and burning. It is the canonical standard, and it works. But it was designed for general-purpose token infrastructure: one where compliance is an application-layer concern. RWA tokenization lives in a regulated world, and in a regulated world certain capabilities are non-negotiable.

A global pause flag is insufficient for regulatory enforcement. Regulators do not want to shut down the entire token; they need to freeze specific holders. An OFAC sanctions list match requires freezing one holder, not all. KYC expiration affects one holder, not the entire token. A regulatory order targets one holder's balance, not all. CIP-0112 alone would leave RWA issuers without the regulatory tools they need, forcing them to enforce compliance outside the ledger, where a restriction is a matter of operational discipline rather than something the ledger refuses to violate.

Every issuer building on Canton today implements their own freeze mechanisms and whitelist logic from scratch. This is inefficient, risky, and fragmented. Separate issuers build freeze mechanisms with different semantics. Multiple teams implement jurisdictional whitelists that wallets cannot support uniformly. The result is not just duplicated effort: it is divergent implementations that create compliance gaps regulators will not accept and security surface area that multiplies with each new project.

As Canton grows, establishing these patterns now is critical before the next million users are onboarded. Retrofitting compliance standards after mass adoption creates friction, migration costs, and potential regulatory exposure. The proposed standard provides the foundation for regulated asset issuance that scales with the network.

The proposal addresses both fragmentation and scale by introducing a shared compliance layer. We seek to define it as a formal Canton standard, harden it through security audit, and deliver it as open-source reference implementations and an integration SDK. No single issuer should have to reinvent these controls.

## Why This Matters Now

**Immediate Pain Point:** RWA issuers on Canton are currently building custom compliance layers. This is duplicated effort across the ecosystem, creating security risks and fragmentation. The proposed standard provides a shared, audited solution.

**Architectural Fit:** The proposed standard is designed as an extension to CIP-0112. It adds no ledger features and requires no change to the core token standard. It relies on Daml's authorisation model (signatory, controller, observer) so that compliance rules are enforced by the ledger when a transaction is validated, rather than by application-layer checks that a caller can bypass.

**Market Timing:** The RWA tokenization market is growing. Canton needs a regulated token standard now to capture institutional interest. The proposed standard fills this gap without waiting for a full version 3 of the base token standard.

**Developer Experience:** A lean, well-scoped SDK reduces integration time from months to weeks, enabling faster adoption by wallet providers, exchanges, and app developers.

---

## Specification Outline

This is an outline. The specification itself is the M1 deliverable, and it will be refined against the pilot integrations in M2 and M3.

### Reused primitives

The standard adds no ledger features and requires no change to CIP-0112. It builds on `HoldingV1.Holding` and `HoldingView`, the `lock` field on `HoldingView`, `InstrumentId`, `TransferInstructionV1.TransferFactory` and `TransferInstruction`, `AllocationV1.Allocation`, and `MetadataV1.Metadata` under a reserved key prefix.

### Templates and interface

The artifacts of the reference design:

| Artifact | Signatories | Description |
| :---- | :---- | :---- |
| `RegistryAuthority` | admin, holder | The holder's standing authority for issuer-initiated action, with choices controlled by the admin for credit, freeze, transfer and upgrade |
| `TransactPermission` | admin | Per-account eligibility, with independent `canSend` and `canReceive` and an expiry. The holder is an observer. Sole admin signature is what makes revocation and reissue unilateral and immediate |
| `TransferApproval` | admin | A per-transfer conclusion, for instruments that declare pairwise counterparty rules. The sender is an observer. Single use, with an amount ceiling and an expiry bounded by the transfer's `executeBefore` |
| `FreezeState` | admin, holder | The authoritative frozen total for a holder, and the part of it not currently backed by holdings. The freeze operation is exercised on `RegistryAuthority` and consumes this contract, which is what turns the expected-value check into a real compare-and-set |
| `InstrumentConfig` | admin | Instrument-level declarations: settlement interval, whether pairwise rules apply, officer set and quorum, regulator profile, metadata prefix. Read non-consumingly, so it is never a contention point |
| `InstrumentSupply` | admin | The supply cap. Consumed and recreated on mint and burn only, and never an input to a transfer |
| `RoleGrant` | admin | Issuer-internal roles as bearer credentials, presented by contract id to the gated choice. Revoked by archival |
| `ApprovalVote` | officer | One officer's approval of a named operation. The highest-impact operations require *k* distinct votes, archived on use |
| `RegulatedHoldingView` (interface) | NA | The wallet-facing read surface, extending `HoldingView` with frozen, withholding and transferable amounts, eligibility, lock reason, settlement status and whether an approval is required. Discoverable by interface query, and declared at first deployment, since a smart contract upgrade cannot add an interface instance to a template already on the ledger |

### Enforcement model

A regulated holding names both the instrument admin and the owner as signatories, and exposes no choice the admin can control alone. The second condition matters: a signatory's consent is captured at creation, so an admin-controlled choice on a jointly signed holding stays exercisable by the admin for that contract's life.

Issuer-initiated action therefore runs through admin-signed contracts the holder co-signed once. Exercising a choice on one confers its signatories' authority to the choice body, so the admin's authority reaches a transaction the holder submits. The admin is a signatory on the holdings involved, so its participant confirms, and the guards are checked as part of that confirmation.

The compliance rulebook stays off the ledger for two independent reasons. Privacy: a contract is accessible only to its stakeholders and prior informees, unless it is attached to a submission as a disclosed contract. Either route hands the rule to the party it constrains, and where the rule is a per-holder list it hands over the register with it. Determinism: a confirming participant checks that a view is the result of a valid Daml interpretation, and because Daml is deterministic the correct response to each view is uniquely determined. A guard therefore cannot depend on data that only the registry holds. Such a rule must be reduced to an admin-signed conclusion, committed before the transaction that relies on it.

### Design points

Four points the specification must settle:

**The settlement window.** `SettlementInfo` carries `allocateBefore` and `settleBefore`, and CIP-0112 defines no compliance behaviour across that interval. A party can become ineligible in between. The specification must define when eligibility is re-verified and what happens to the other legs. Redirecting to a suspense account is not available: `TransferLeg` fixes the receiver, and `Allocation_ExecuteTransfer` is jointly controlled by executor, sender and receiver. So the choice is between failing the leg and delivering under a lock, and it likely differs by reason code.

**Pairwise rules.** Rules over pairs of parties fail both constraints above. On the ledger they disclose the register; held privately they cannot be read by the transaction that needs them; and either way they cannot be evaluated at validation. Reducing them to a per-transfer admin-signed conclusion is the candidate mechanism. The specification must define it so the round trip falls only on instruments that declare such rules.

**Self-custody.** Holders who keep their own keys submit through the interactive submission service, which constrains the shape of what they may submit: in the 3.3 line, a single root node and a single authorising party. That constraint is version-dependent, so the specification must name the version it targets rather than restate the rule, and require the conformance suite to run the full holder lifecycle as an externally signed party against that version. Every holder-initiated action must be expressible under the constraint in force, or self-custody holders are excluded.

**Disclosure through failure.** A rejection reason reaching a submitter is a disclosure channel, and a code naming a counterparty reveals that counterparty's compliance state without their consent. The specification must define which codes go to whom, and what a submitter is told when the reason belongs to someone else.

### Properties

The artifacts above are the reference design. What the specification guarantees, and what the conformance suite asserts, is the following, whatever shape those artifacts take:

1. No regulated holding moves without the instrument admin's authority, and no holding exposes a choice the admin can exercise alone.
2. A holder reads its own eligibility and frozen total from contracts it is party to, without consulting the registry.
3. A frozen amount cannot leave a holder's control by any party, the admin included, except in a single transaction that also reduces the frozen total.
4. Missing or expired eligibility fails closed. An absent freeze record fails open.
5. The frozen total reconciles atomically: two operators acting concurrently produce a conflict the ledger resolves, never a lost update.
6. A per-transfer approval is single use, and cannot outlive the deadline of the transfer it was issued against.
7. A rejection tells the submitter a code and nothing further, and never a code that belongs to a third party.

---

## Scope of Work

The grant funds the following deliverables:

1. **CIP specification document.** A formal standards-track CIP specification submitted to `canton-foundation/cips` following the CIP process, defining `RegistryAuthority`, `TransactPermission`, `TransferApproval`, `FreezeState`, `InstrumentConfig`, the freeze and issuer-initiated transfer semantics, the officer quorum, the transfer and settlement enforcement points, the three reason-code registries, and compatibility with CIP-0112.

2. **Reference implementation.** DAML templates implementing the specification, with unit tests covering every property above, including the self-custody path and the negative structural case of the enforcement model. Open-source under Apache-2.0.

3. **Security audit.** Third-party audit of the reference implementation. All findings resolved before milestone acceptance.

4. **Conformance suite.** An automated test suite covering the properties above, which any token implementation can run to verify compliance with the proposed standard.

5. **Integration SDK (core).** A focused open-source client library with documentation, covering the highest-value integrations: wallet balance and transfer adapters, `RegulatedHoldingView` rendering, approval request flow, and reason code resolution under the disclosure rules.

6. **Real-client integrations.** Direct engineering support for RWA issuers adopting the standard on Canton testnet and production, validating it against live asset tokenization workloads and feeding findings back into the specification.

## Backwards Compatibility

The proposed standard is fully compatible with CIP-0112 at the protocol level. Regulated holdings implement the CIP-0112 `Holding` interface unchanged, so balance display and transfer operations remain accessible through the core CIP-0112 API. The compliance controls are opt-in per token: an instrument that establishes no `RegistryAuthority`, issues no `TransactPermission` and declares no pairwise rules behaves as an ordinary CIP-0112 token.

Tokens that do enable the controls require wallet awareness of `RegulatedHoldingView` and of compliance lock reason codes for full functionality. A CIP-0112 wallet with no such awareness will correctly display balances and correctly fail restricted transfers, but will not be able to explain why. Because support is discoverable by interface query, such a wallet can detect that it is looking at a regulated instrument even before it can interpret one. The SDK of deliverable 5 closes that gap for adopting wallets.

## Grant Request

This proposal requests funding from the Canton Development Fund to develop the Regulated Token Standard as a public good. The deliverables are a formal specification, a reference implementation, a security audit, a conformance suite, a focused integration SDK, and direct engineering support for real-client integrations. All output is open-source and freely adoptable by any party on the Canton Network.

### Milestones

| # | Milestone | Timeline | Deliverables | Payment |
|---|-----------|----------|-------------|---------|
| Setup | Project Setup & Bootstrap | Month 1 | Project initialization, development environment setup, initial spec draft, identification of pilot issuer partners | 400,000 CC |
| M1 | CIP Specification & Reference Implementation | Months 2–4 | Regulated Token Standard specification PR merged to `canton-foundation/cips` as Draft, DAML reference implementation with unit tests, conformance suite v1 runnable | 950,000 CC |
| M2 | Security Audit & SDK Core Phase 1 | Months 5–8 | Third-party security audit report (critical/high resolved), SDK core module Phase 1 (wallet adapter foundation), first client deployed on Canton testnet | 1,300,000 CC |
| M3 | SDK Completion & First Production Client | Months 9–12 | SDK core Phase 2, compliance CLI tooling, conformance suite complete, the M2 client live in production with tokenized assets on Canton | 1,900,000 CC |
| M4 | Ecosystem Adoption & Maintenance Handoff | Months 13–15 | 2 additional adopters live with tokenized assets on Canton, bringing the total to 3 unique adopters live on the network of which at least 1 in production; the specification advances to Proposed status; maintenance plan published with transition to 2026-Maintenance Grant for Daml Open Source | 1,300,000 CC |
| Bonus | Performance Incentive | Assessed at M4 acceptance (Month 15) | Each unique adopter beyond three, live **in production** with tokenized assets and independent of Brickken: +150,000 CC for the 4th, +150,000 CC for the 5th, +150,000 CC for the 6th | Up to 450,000 CC |

### Funding

**Total requested:** 5,850,000 CC paid per milestone acceptance. Maximum including bonus: 6,300,000 CC.

| Category | CC Amount | % of Total |
|---|---|---|
| Project setup & bootstrap | 400,000 | 6.8% |
| CIP specification & reference implementation | 950,000 | 16.2% |
| Security audit (third-party) | 850,000 | 14.5% |
| SDK development & documentation, core | 1,050,000 | 17.9% |
| Compliance CLI tooling | 300,000 | 5.1% |
| Client integrations: 3 adopters live | 1,150,000 | 19.7% |
| Conformance suite | 700,000 | 12.0% |
| Ecosystem adoption & maintenance handoff | 450,000 | 7.7% |
| **Total** | **5,850,000** | **100%** |

Percentages are rounded to one decimal place and therefore sum to 99.9%. The CC amounts are exact and sum to the stated total.

**Allocation by milestone.** The split is stated explicitly so that the two tables above reconcile:

| Category | Setup | M1 | M2 | M3 | M4 | Total |
|---|---:|---:|---:|---:|---:|---:|
| Project setup & bootstrap | 400,000 | 0 | 0 | 0 | 0 | 400,000 |
| Spec & reference implementation | 0 | 950,000 | 0 | 0 | 0 | 950,000 |
| Security audit | 0 | 0 | 850,000 | 0 | 0 | 850,000 |
| SDK core | 0 | 0 | 300,000 | 750,000 | 0 | 1,050,000 |
| Compliance CLI | 0 | 0 | 0 | 300,000 | 0 | 300,000 |
| Client integrations | 0 | 0 | 50,000 | 250,000 | 850,000 | 1,150,000 |
| Conformance suite | 0 | 0 | 100,000 | 600,000 | 0 | 700,000 |
| Ecosystem adoption & handoff | 0 | 0 | 0 | 0 | 450,000 | 450,000 |
| **Milestone total** | **400,000** | **950,000** | **1,300,000** | **1,900,000** | **1,300,000** | **5,850,000** |

Note that the conformance suite's *deliverable* is staged (v1 runnable at M1 as part of the reference implementation work, complete at M3) while the majority of its *cost* falls in M2–M3, as the negative cases are added against the audited implementation. If the Foundation prefers cost and deliverable to coincide, M1 becomes 1,650,000 CC with M2 and M3 reduced correspondingly; the total is unchanged either way.

**Budget Rationale:** Client integrations are the largest single line (19.7%) and carry the delivery risk: three live adopters across testnet and production is what validates the standard against real regulatory workloads rather than theoretical ones. The SDK core (17.9%) is tightly scoped to compliance state rendering, the approval request flow and transfer adaptation. The audit budget (14.5%) addresses institutional trust requirements. The conformance suite (12.0%) makes the negative cases executable, which is what prevents divergent implementations across the ecosystem. The compliance CLI is a focused, high-value tool for issuers and regulators.

**Financial Protocols on Acceleration/Delay:**

- **Acceleration Bonus:** Up to 450,000 CC, assessed at M4 acceptance in Month 15, for each unique adopter beyond three that is live in production with tokenized assets and independent of Brickken: +150,000 CC for the fourth, +150,000 CC for the fifth, +150,000 CC for the sixth. Assessment falls inside the grant term, so the condition is verifiable.
- **SLA Penalties:** If M4 (CIP status advancement + 3 total live adopters) is delayed beyond Month 15 due to delivery issues, a 10% haircut applies to the M4 payout (130,000 CC reduction). Delays caused by Foundation governance timeline are exempt.
- **Standard Penalty:** For all other milestones, a 10% reduction of the milestone payout applies if delivered >30 days past the stated target date.

**Volatility Stipulation:**

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

**Risk Allocation:**

Brickken explicitly assumes the financial risk of executing engineering phases in parallel to the CIP approval process. Should the governance discussion amend or reject the proposed CIP, Brickken absorbs the wasted work without requesting supplemental Foundation funds. Brickken will make commercially reasonable efforts to include scope changes under the current milestone deliverables and timelines.

**Maintenance Handoff:**

This proposal does not request funding for ongoing operational maintenance. Upon successful completion of **M4**, day-to-day maintenance of the Regulated Token Standard reference implementation (security patches, bug fixes, CI/CD management, external PR reviews) transitions to the *2026-Maintenance Grant for Daml Open Source*. Until M4 acceptance, maintenance is Brickken's own responsibility under this grant, since the implementation is still under active development through M3 and cannot be handed off earlier. Breaking changes require new CIP submission and voting. Bug fixes and non-breaking improvements follow standard PR process.

This handoff depends on the 2026-Maintenance Grant accepting the reference implementation into its scope. Brickken will seek written confirmation before M4 acceptance. If it is not forthcoming, Brickken will publish the maintenance plan naming an alternative owner rather than leave the implementation unmaintained.

### Acceptance Criteria & SLOs

| Milestone | Primary Acceptance Signal | SLO |
|---|---|---|
| **Setup** | Development environment ready + initial spec draft submitted | Repo initialized, dev docs published |
| **M1** | Spec PR merged to cips repo + reference implementation compiles + tests passing + conformance suite v1 runnable | All Daml Script tests pass; ≥90% template and choice coverage as reported by `daml test`; every property represented as an executing test, negative cases asserting the specified rejection code |
| **M2** | Audit report published (critical/high resolved) + SDK core module released + first client on testnet | Zero critical/high findings open; SDK core documented; 1 client deployed on testnet |
| **M3** | SDK v1.0 released + CLI tooling + conformance suite complete + M2 client in production | All SDK modules documented; CLI exercises every issuer-facing operation the standard defines against the reference implementation and renders every code in the reason-code registries; 1 client live in production with tokenized assets |
| **M4** | 3 total unique adopters live with tokenized assets + CIP advances to Proposed status + maintenance handoff plan published | ≥3 live adopters, ≥1 in production; CIP status updated to Proposed; maintenance plan published with owner named |

**Service Level Objectives:**

- **Critical Security Vulnerabilities:** Patch or mitigation plan within 48 hours of discovery, from M2 acceptance until M4 acceptance; thereafter under the maintenance grant on its terms.
- **Community PRs:** Reviewed within 10 business days, by Brickken from M1 until M4 acceptance, thereafter under the maintenance grant.
- **Documentation:** Updated within 5 business days of any breaking change.

### Track Record

Brickken has taken an open technical standard from specification through to independent ecosystem implementation. [ERC-7943](https://eips.ethereum.org/EIPS/eip-7943), known as uRWA, is a Final Standards Track ERC defining common interfaces for compliance checks, transfer controls, asset freezing and enforcement actions on tokenized real-world assets. It was co-authored by Brickken's Co-Founder and Head of Blockchain, Dario Lo Buglio, with Tino Martinez Molina and Mihai Colceriu, and developed with the support of a coalition of RWA infrastructure providers.\*

This proposal brings that work to Canton. uRWA settled which controls a regulated token needs, so rather than reopening the question this proposal reuses the answer and derives the mechanisms from Canton's own authorisation and privacy model, which is what the design points above are about. Brickken has carried a regulated asset standard from draft to Final and into implementations by parties other than itself, and proposes to do the same here.

### Adoption Validation

The Regulated Token Standard is not designed in a vacuum. The grant funds direct engineering collaboration with active RWA issuers tokenizing real assets on Canton: one on testnet by M2, the same issuer in production by M3, and two further adopters by M4 for a total of three live on the network. These integrations inform specification refinements during M2–M3, ensuring the standard reflects actual issuer requirements rather than theoretical use cases. Findings feed back into the SDK and the conformance suite.

## References

- [CIP-0000: CIP Process](https://github.com/canton-foundation/cips/blob/main/cip-0000/cip-0000.md)
- [CIP-0056: Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0082: Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100: Governance of the CIP-0082 Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP-0112: Token Standard V2](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [ERC-7943: uRWA, Universal Real World Asset Interface](https://eips.ethereum.org/EIPS/eip-7943) (Final)
- [MiFID II](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014L0065)
- [FINMA Tokenization Guidelines](https://www.finma.ch)
- [SEC Regulation D](https://www.sec.gov)
- [Canton Documentation](https://docs.canton.network/)

\* Third-party implementation and support of ERC-7943:

- [OpenZeppelin Community Contracts Reference Implementation](https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/master/contracts/token/ERC20/extensions/ERC20uRWA.sol)
- [CMTAT Solidity implementation](https://cmta.ch/news-articles/cmtat-solidity-implementation-adds-support-for-erc-7943)
- [Zoth](https://x.com/zothdotio/status/1967505646800310311)
- [Hacken](https://x.com/hackenclub/status/1966178497334071365)
- [Compellio](https://x.com/compellio/status/1965784955008799067)

## Copyright

Copyright of this document is waived, and the subject matter is dedicated to the public under the [CC0-1.0 Universal License](https://creativecommons.org/publicdomain/zero/1.0/).
Code in the reference implementation is licensed under [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).
