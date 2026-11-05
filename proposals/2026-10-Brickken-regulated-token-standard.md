# Development Fund Proposal

## Regulated Token Standard

| Field | Value |
| :---- | :---- |
| Authors | Thamer Dridi <thamer@brickken.com><br>Nabil El Alami Khalifi <nabil@brickken.com> |
| Org | Brickken |
| Status | Draft |
| Created | 2026-10-07 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP-12 RWA Standards, Daml and Institutional RWA Workflow Standards |
| Label | token-asset-standards |
| Total Funding Request | 5,850,000 CC (up to 6,300,000 CC including the adoption bonus) |
| Project Duration | 15 months |
| [Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md) | Needs Champion |

---

## Abstract

The Regulated Token Standard specifies, as a shared standard, the compliance controls of a regulated token on Canton: who may send and receive, how holdings are frozen, and when the instrument admin may move a holder's holdings, and within which bounds, so that Real World Asset issuers on Canton can meet their obligations without a separate token ecosystem. It takes [ERC-7943](https://eips.ethereum.org/EIPS/eip-7943) (uRWA), a Final Standards Track ERC co-authored by Dario Lo Buglio, Tino Martinez Molina and Mihai Colceriu, as its starting point for which controls a regulated token needs, and derives the mechanisms from Canton's own authorisation and privacy model.

The standard adds one package of three interfaces. `RegulatedAccount` carries an account's eligibility to send and to receive, and its authoritative frozen total. `RegulatedHolding` marks a holding as regulated and exposes the reason for any lock on it. `EnforcementAuthority` carries a bounded, expiring authorisation for admin-initiated movement. Around them the standard specifies freeze semantics over the existing `Holding` lock, an enforcement transfer expressed as an ordinary transfer, and the points on the transfer and settlement paths where the checks must be applied.

Enforcement follows the registry-authority pattern the token standard already uses: the instrument admin is the signatory of the regulated holdings, and the holder's consent to admin-initiated movement is recorded in advance, in the `RegulatedAccount` contract the holder co-signs. That contract exposes no choice by which the admin can move more than the holder agreed to there, and every movement stays within the bounds of an `EnforcementAuthority`. The checks live in the Daml body of the choice, so every participant hosting a party whose approval the transaction requires verifies them before the mediator accepts the transaction, and a submitter cannot skip them.

This proposal requests funding to define the specification, develop the reference implementation, conduct a security audit, release a conformance suite and integration SDK as a public good for the Canton ecosystem, and bootstrap its adoption through the client deployments set as milestone deliverables.

## Motivation

Canton's Token Standards ([CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md), [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)) cover the transfer and settlement mechanics of fungible tokens well: instructions, allocations, DVP, event reporting. What they do not specify is the compliance layer a regulated instrument needs on top. RWA tokenization lives in a regulated world, and in a regulated world certain capabilities are non-negotiable.

A global pause flag is insufficient for regulatory enforcement, and [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)'s is off-ledger metadata only ([§4.1.7](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md#417-reporting-of-paused-status)). Regulators do not want to shut down the entire token; they need to freeze specific holders. An OFAC sanctions list match requires freezing one holder, not all. KYC expiration affects one holder, not the entire token. A regulatory order targets one holder's balance, not all. Without these controls on the ledger, RWA issuers are forced to enforce compliance outside it, where a restriction is a matter of operational discipline rather than something the ledger refuses to violate.

An issuer that needs to freeze a holder or gate a jurisdiction today has to build the mechanism itself, because neither standard specifies one. The obligations behind these controls are not hypothetical: private-placement regimes such as SEC Regulation D and EU regimes such as MiFID II condition issuance and secondary transfer on holder eligibility, and the Swiss DLT Act gives registered securities on DLT platforms an explicit legal basis. Each issuer builds freeze mechanisms with different semantics. Each team's jurisdictional whitelist is one that wallets cannot support uniformly, because there is no interface to read it. The result is duplicated effort and, worse, divergent implementations whose differences are exactly where compliance gaps and security bugs hide.

There is no standard freeze, no standard eligibility record, and no interface through which a wallet or an exchange can read either. Each issuer that needs them builds and audits its own, and no integrator can reuse that work across instruments. Establishing the shared patterns now, before the next wave of issuers onboards, avoids the retrofit: compliance standards added after mass adoption carry migration costs and regulatory exposure that standards agreed early do not.

Architecturally this is an extension: the standard builds on [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md), adds one package, and requires no change to any existing Splice package. It relies on Daml's authorisation model, where a contract cannot be archived without the authority of its signatories, so compliance rules are enforced when the transaction is validated rather than by application-layer checks a caller can bypass. And it does not wait on a revision of the base token standard: the controls are additive and opt-in per instrument.

The proposal addresses fragmentation and scale with one shared compliance layer, defined as a formal Canton standard, hardened through a security audit, and delivered as an open-source reference implementation and integration SDK. No single issuer should have to reinvent these controls, and a wallet, exchange or app should integrate the compliance layer once rather than each issuer's own mechanism separately.

---

## Specification Outline

This is an outline. The specification itself is the M1 deliverable, and it will be refined against the pilot integrations in M2 and M3.

### Base standard

This standard builds on the Canton Network Token Standard V2, [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md), and targets its V2 packages. It specifies, as a shared standard, the compliance controls of a regulated token on Canton: who may send and receive, how holdings are frozen, and when the instrument admin may move a holder's holdings, and within which bounds.

### Reused primitives

- `splice-api-token-holding-v2`
- `splice-api-token-transfer-instruction-v2`
- `splice-api-token-allocation-v2`
- `splice-api-token-allocation-instruction-v2`
- `splice-api-token-transfer-events-v2`
- `splice-api-token-metadata-v1`

### Specification

We propose to add one package, `splice-api-token-compliance-v1`.

#### `RegulatedAccount`

```daml
data RegulatedAccountView = RegulatedAccountView with
    instrumentId : InstrumentId
    account : Account
    canSend : Bool
    canReceive : Bool
    eligibilityExpiresAt : Optional Time
    frozenAmount : Decimal
      -- ^ The authoritative frozen total for this account.
    frozenLocked : Decimal
      -- ^ The part of `frozenAmount` materialised as `Lock` on the account's holdings.
    reason : Optional Text
      -- ^ Reason code for any restriction.
    meta : Metadata
  deriving (Eq, Show, Serializable)

interface RegulatedAccount where
  viewtype RegulatedAccountView
```

#### `RegulatedHolding`

```daml
data RegulatedHoldingView = RegulatedHoldingView with
    lockReason : Optional Text
      -- ^ Machine-readable counterpart of `Lock.context`.
    meta : Metadata
  deriving (Eq, Show, Serializable)

interface RegulatedHolding requires HoldingV2.Holding where
  viewtype RegulatedHoldingView
```

#### `EnforcementAuthority`

```daml
data EnforcementAuthorityView = EnforcementAuthorityView with
    instrumentId : InstrumentId
    account : Account
    grantee : Party
      -- ^ The party that may exercise this authority.
    purposes : [Text]
      -- ^ An authority granted for one purpose MUST NOT authorize another.
    amountCeiling : Decimal
      -- ^ Cumulative over the authority's lifetime.
    amountUsed : Decimal
    expiresAt : Time
    meta : Metadata
  deriving (Eq, Show, Serializable)

interface EnforcementAuthority where
  viewtype EnforcementAuthorityView
```

### Enforcement model

The following are normative on implementations. The guard is the check an implementation performs before moving a holding: that the sending and receiving accounts are eligible in their `RegulatedAccount` contracts, that the amount does not encroach on the frozen total recorded there, and that any conclusion the instrument's rules require is present. An admin-initiated movement is one whose `actors` include the admin.

**Authority:** A regulated holding MUST name the instrument admin as a signatory, and MUST expose no choice that moves it without the guard. The holder's consent to admin-initiated movement MUST be given in advance, by co-signing the account's `RegulatedAccount` contract, whose choices are the only path by which the admin moves the holder's holdings. Every choice of `RegulatedAccount` that changes it or moves the holder's holdings MUST be controlled by the admin, and never by the holder, so that the holder's co-signature is given once and never requested again. A choice of `RegulatedAccount` controlled by the holder executes with the admin's authority as a signatory, and MUST NOT exercise that authority, in particular to archive the contract or to change its frozen total or eligibility. The holder is therefore bound by what they signed on the account, and the admin can move no more than that contract and the applicable `EnforcementAuthority` together allow; the holder cannot bypass the guard, and the admin can neither archive the account nor replace the holder without the holder's co-signature. This follows the registry-authority pattern of the token standard, where the `admin` holds the moving authority and account-level authorization is expressed through contracts the account parties sign (as Canton Coin does for incoming transfers via transfer preapproval, [CIP-0119](https://github.com/canton-foundation/cips/blob/main/cip-0119/cip-0119.md)).

**Guard points:** The guard MUST be applied in every implementation whose body consumes or creates a `Holding`, whichever interface version that implementation belongs to. This includes the creation of an allocation and its settlement, both of which consume holdings and create change, so neither may use frozen funds. A body that only applies or releases a freeze `Lock` and leaves the holdings in the same account is not a movement, and the guard does not apply to it.

**Delegation:** The admin's authority to move a holder's holdings comes from the holder's co-signature on the account's `RegulatedAccount` contract. Eligibility does not supply it. An admin-initiated movement MUST additionally be authorised by an `EnforcementAuthority`, within its purposes, ceiling and expiry, and MUST include the authority's `grantee` among its `actors`. Each use MUST consume and recreate the authority with `amountUsed` increased, and MUST fail if `amountUsed` would exceed `amountCeiling`. An `EnforcementAuthority` MUST name the admin as a signatory, which is how it is granted, and is revoked by archiving it without a replacement, which only the admin can do.

**Freeze representation:** The frozen total MAY exceed the account's balance. It MUST be materialised as `Lock` on the account's holdings up to the amount they cover, with `holders` including the admin and `context` set, and MUST NOT set `expiresAt` or `expiresAfter`. An implementation that archives and recreates an account's holdings MUST re-apply the lock to the outputs in the same transaction. The account's `RegulatedAccount` contract MUST also record, as `frozenLocked`, how much of its `frozenAmount` is materialised as `Lock`. Every transaction that changes freeze-locked holdings MUST update `frozenLocked` by exactly the net change, never above `frozenAmount`, and incoming holdings MUST be locked while `frozenLocked` is below `frozenAmount`.

**Reporting:** Every create or archive of a regulated holding MUST be represented in exactly one `EventLog_HoldingsChange` with matching `admin` and `account`, carrying a reason code at `splice.lfdecentralizedtrust.org/reason` in `extraArgs` where the change is admin-initiated or compliance-restricted.

**Enforcement transfer:** An enforcement transfer MUST be expressed as `TransferFactory_Transfer` with the admin and the authority's `grantee` among `actors`, the authority supplied through `extraArgs`, and MUST be executed through the account's `RegulatedAccount` contract. Its guard checks only that the receiving account is eligible. Where it moves freeze-locked holdings, the same transaction MUST release their `Lock` and reduce the frozen total by the amount released.

**Rule delivery:** A conclusion is a contract the admin creates recording a determination the instrument's rules require for a specific transaction, served to that transaction as a disclosed contract in its choice context. It MUST be committed on-ledger by the admin before the transaction that relies on it. It is single use, MUST carry its own expiry, and MUST NOT outlive the `executeBefore` of its `Transfer` or, where set, the `settlementDeadline` of its `AllocationSpecification`.

**Readability:** The holder and the provider of an account MUST be able to read the eligibility and frozen total recorded in its `RegulatedAccount` from contracts they are party to.

**Missing records:** The guard MUST be given the account's `RegulatedAccount` contract and MUST verify that its `instrumentId` and `account` match the holding. A transaction without it, or with one past its `eligibilityExpiresAt`, MUST fail, unless it is an enforcement transfer out of the account. The admin MUST maintain at most one active `RegulatedAccount` per (`instrumentId`, `account`).

**Time:** All expiry checks (`eligibilityExpiresAt`, `EnforcementAuthority.expiresAt`, conclusion expiry) MUST use ledger-time bounds rather than reading the ledger time, so that these checks do not tie an externally signed transaction to the time it was prepared.

**Reconciliation:** A change to the frozen total in an account's `RegulatedAccount` MUST consume and recreate that contract, so that two concurrent changes conflict at the ledger.

**Rejection:** A rejection MUST disclose a reason code and nothing else, and never a code belonging to a third party.

**Compatibility:** A regulated holding MUST implement the `Holding` interface of both `splice-api-token-holding-v1` and `splice-api-token-holding-v2`, so that a V1 wallet reads balances on a regulated instrument unchanged. The obligation is on the implementation, not on `RegulatedHolding`, so that this package carries no dependency on a legacy version.

### Design points

**The settlement window:** The eligibility recorded in an account's `RegulatedAccount` can be revoked or expire between allocating and settling, and iterated settlement reopens that gap on every iteration. A settlement is one choice whose legs must cover exactly what the allocations authorised, so refusing one account fails it for everyone in it. The specification must decide when eligibility is re-checked, and what outcome is possible other than failing the whole settlement.

**Pairwise rules:** Some rules are about the pair: A may send, B may receive, A to B is forbidden. That cannot be checked from a transaction's inputs, so the admin decides in advance and serves the conclusion in the choice context. The specification must define the shape of a conclusion and whether it is a standardised interface, and cap how many one settlement can require.

**Self-custody:** A holder signing off-node prepares the transaction first and submits it later. Revoking eligibility in between kills the prepared transaction, which is the point of revoking it. The specification must say which wins.

**Disclosure through failure:** A reason code is not the only leak. Attaching a conclusion to a transaction reveals that one was needed, and `Lock.context` is readable by parties who cannot see the contracts it describes. The specification must define which codes reach whom.

**Pre-freezing:** The frozen total may exceed what the account currently holds, so that tokens arriving later are locked as they land. A UTXO ledger has no holding yet to carry that lock, so the part the holdings do not cover has to live on the account's `RegulatedAccount` and be applied to holdings as they arrive. The specification must define how an incoming holding larger than the uncovered part is split, so that only that part is locked.

**Mint and burn:** The specification must define how the guard and `EnforcementAuthority` apply to minting and burning.

### Properties

Asserted by the conformance suite.

1. No regulated holding moves without the instrument admin's authority.
2. No regulated holding template exposes a choice that moves it without the guard.
3. Every admin-initiated movement is authorised by an `EnforcementAuthority`, and none exceeds its purposes, ceiling or expiry.
4. The holder and the provider of an account read the eligibility and frozen total recorded in its `RegulatedAccount` from contracts they are party to.
5. Frozen funds do not leave an account's control, by any party including the admin, except in a transaction that also reduces the frozen total in the account's `RegulatedAccount`.
6. A settlement that nets debits and credits for an account leaves the frozen total in its `RegulatedAccount` intact, as does each iteration of an iterated settlement.
7. An account cannot transact without its `RegulatedAccount`, and once past its `eligibilityExpiresAt` can only be the source of an enforcement transfer.
8. Concurrent changes to a frozen total conflict at the ledger. No update is lost.
9. A conclusion served in a choice context is single use, carries its own expiry, and does not outlive the `executeBefore` of its `Transfer` or, where set, the `settlementDeadline` of its `AllocationSpecification`.
10. A rejection discloses a reason code and nothing else, and never a code belonging to a third party.
11. Every regulated holding is a valid `Holding` under the V1 and V2 interfaces.
12. Every create or archive of a regulated holding is represented in exactly one `EventLog_HoldingsChange` with matching `admin` and `account`, carrying a reason code in `extraArgs` where the change is admin-initiated or compliance-restricted.
13. The guard holds at the largest allocation a registry must support: 25 transfer legs, 25 distinct instrument ids, 50 distinct accounts, 100 distinct parties.

---

## Scope of Work

The grant funds the following deliverables:

1. **CIP specification document.** A standards-track CIP submitted to [`canton-foundation/cips`](https://github.com/canton-foundation/cips) under the [CIP-0000](https://github.com/canton-foundation/cips/blob/main/cip-0000/cip-0000.md) process, specifying the `splice-api-token-compliance-v1` package and its three interfaces, `RegulatedAccount`, `RegulatedHolding` and `EnforcementAuthority`; the freeze semantics over the `Holding` lock; the enforcement transfer; the guard and the points at which it applies; the reason-code convention under `splice.lfdecentralizedtrust.org/reason`; and compatibility with the V1 and V2 `Holding` interfaces.

2. **Reference implementation.** Daml templates implementing the specification, with Daml Script tests that exercise it end to end, including the self-custody path and the negative case in which a template exposes a choice that moves a holding without the guard. Open source under Apache-2.0, matching the Splice repository.

3. **Security audit.** Third-party audit of the reference implementation. Findings of medium severity and above resolved before milestone acceptance, the remainder either fixed or documented with rationale.

4. **Conformance suite.** The thirteen properties packaged as an automated suite that runs against any implementation's own templates rather than only ours, so that a registry can demonstrate conformance without reading the reference implementation.

5. **Integration SDK (core).** A focused open-source client library with documentation, covering the highest-value integrations: wallet balance and transfer adapters, rendering of an account's eligibility and frozen total from `RegulatedAccountView` and of a holding's lock reason, the flow for fetching and attaching a choice context, and reason-code resolution under the disclosure rules.

6. **Pilot integrations.** Direct engineering support for RWA issuers adopting the standard on TestNet and MainNet, validating it against live asset tokenization workloads and feeding findings back into the specification.

## Backwards Compatibility

The proposed standard is compatible with [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) at the interface level. A regulated holding implements the [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) `Holding` interface unchanged, so a wallet that knows only the V1 or V2 `Holding` interface reads balances on a regulated instrument correctly, and transfers stay callable through the same `TransferFactory_Transfer` choice, subject to the guard. The controls are opt-in per instrument: an instrument whose templates do not implement `splice-api-token-compliance-v1` is an ordinary [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) token and is untouched by this standard.

An instrument that does enable the controls needs wallet awareness of `RegulatedAccountView` and of the reason codes for full functionality. A wallet without that awareness displays balances correctly and fails restricted transfers correctly, but cannot explain why. A wallet that knows the interface id can filter for it on the Ledger API, and so can detect that it is looking at a regulated instrument before it can interpret one. The SDK of deliverable 5 closes that gap for adopting wallets.

## Grant Request

This proposal requests funding from the Canton Development Fund to develop the Regulated Token Standard as a public good. The deliverables are a formal specification, a reference implementation, a security audit, a conformance suite, a focused integration SDK, and direct engineering support for real-client integrations. All output is open-source and freely adoptable by any party on the Canton Network.

### Milestones

| # | Milestone | Timeline | Deliverables | Payment |
|---|-----------|----------|-------------|---------|
| Setup | Project Setup & Bootstrap | Month 1 | Project initialization, development environment setup, initial spec draft, identification of pilot issuer partners | 400,000 CC |
| M1 | CIP Specification & Reference Implementation | Months 2–4 | Regulated Token Standard specification PR merged to `canton-foundation/cips` as Draft, proof of concept, Daml reference implementation with Daml Script tests, conformance suite v1 runnable | 950,000 CC |
| M2 | Security Audit & SDK Core Phase 1 | Months 5–8 | Third-party security audit report (medium+ resolved), SDK core module Phase 1 (wallet adapter foundation), 2 clients with different use cases testing on TestNet | 1,300,000 CC |
| M3 | SDK Completion & Production Clients | Months 9–12 | SDK core Phase 2, compliance CLI tooling, conformance suite complete, the 2 M2 clients live in production with tokenized assets on Canton | 1,900,000 CC |
| M4 | Ecosystem Adoption & Maintenance Handoff | Months 13–15 | 5+ white-label deployments of the standard live on MainNet; maintenance plan published with transition to 2026-Maintenance Grant for Daml Open Source; target: the specification advances to Proposed status | 1,300,000 CC |
| Bonus | Adoption Bonus | Assessed at M4 acceptance (Month 15) | Each unique additional adopter, live **in production** with tokenized assets and independent of Brickken: +150,000 CC each | Up to 450,000 CC |

### Funding

**Total requested:** 5,850,000 CC paid per milestone acceptance. Maximum including bonus: 6,300,000 CC.

| Category | CC Amount | % of Total |
|---|---|---|
| Project setup & bootstrap | 400,000 | 6.8% |
| CIP specification & reference implementation | 950,000 | 16.2% |
| Security audit (third-party) | 850,000 | 14.5% |
| SDK development & documentation, core | 1,050,000 | 17.9% |
| Compliance CLI tooling | 300,000 | 5.1% |
| Client integrations & white-label deployments | 1,150,000 | 19.7% |
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

**Budget Rationale:** Client integrations are the largest single line (19.7%) and carry the delivery risk: two clients taken from TestNet to production, then 5+ white-label deployments on MainNet, are what validate the standard against real regulatory workloads rather than theoretical ones. The SDK core (17.9%) is tightly scoped to compliance state rendering and transfer adaptation. The audit budget (14.5%) addresses institutional trust requirements. The conformance suite (12.0%) makes the negative cases executable, which is what prevents divergent implementations across the ecosystem. The compliance CLI is a focused, high-value tool for issuers and regulators.

**Financial Protocols on Acceleration/Delay:**

- **Adoption Bonus:** Up to 450,000 CC, assessed at M4 acceptance in Month 15, for each unique additional adopter that is live in production with tokenized assets and independent of Brickken: +150,000 CC each. Assessment falls inside the grant term, so the condition is verifiable.
- **SLA Penalties:** If M4 (5+ white-label deployments on MainNet) is delayed beyond Month 15 due to delivery issues, a 10% haircut applies to the M4 payout (130,000 CC reduction). Delays caused by Foundation governance or CIP governance timelines are exempt.
- **Standard Penalty:** For all other milestones, a 10% reduction of the milestone payout applies if delivered >30 days past the stated target date.

**Volatility Stipulation:**

The grant is denominated in Canton Coin and will require a re-evaluation at the 6-month mark.

**Risk Allocation:**

Brickken explicitly assumes the financial risk of executing engineering phases in parallel to the CIP approval process. Should the governance discussion amend or reject the proposed CIP, Brickken absorbs the wasted work without requesting supplemental Foundation funds. Brickken will make commercially reasonable efforts to include scope changes under the current milestone deliverables and timelines.

**Maintenance Handoff:**

This proposal does not request funding for ongoing operational maintenance. Upon successful completion of **M4**, day-to-day maintenance of the Regulated Token Standard reference implementation (security patches, bug fixes, CI/CD management, external PR reviews) transitions to the *2026-Maintenance Grant for Daml Open Source*. Until M4 acceptance, maintenance is Brickken's own responsibility under this grant, since the implementation is still under active development through M3 and cannot be handed off earlier. Breaking changes require new CIP submission and voting. Bug fixes and non-breaking improvements follow standard PR process.

This handoff depends on the 2026-Maintenance Grant accepting the reference implementation into its scope. Brickken will seek written confirmation before M4 acceptance. If it is not forthcoming, Brickken will publish the maintenance plan naming an alternative owner rather than leave the implementation unmaintained.

### Acceptance Criteria & SLOs

| Milestone | Primary Acceptance Signal | SLO |
|---|---|---|
| **Setup** | Development environment ready + initial spec draft submitted | Repo initialized, dev docs published |
| **M1** | Spec PR merged to cips repo + proof of concept + reference implementation compiles + tests passing + conformance suite v1 runnable | All Daml Script tests pass; ≥90% template and choice coverage; every property represented as an executing test, negative cases asserting the specified rejection code |
| **M2** | Audit report published (medium+ resolved) + SDK core module released + 2 clients testing on TestNet | Zero medium+ findings open; SDK core documented; 2 clients with different use cases on TestNet |
| **M3** | SDK v1.0 released + CLI tooling + conformance suite complete + the 2 M2 clients in production | All SDK modules documented; CLI exercises every issuer-facing operation the standard defines against the reference implementation; 2 clients live in production with tokenized assets |
| **M4** | 5+ white-label deployments on MainNet + maintenance handoff plan published | ≥5 white-label deployments live on MainNet; maintenance plan published with owner named. Target (not an acceptance condition, as it depends on CIP governance): the specification advances to Proposed status per CIP-0000 |

**Service Level Objectives:**

- **Critical Security Vulnerabilities:** Patch or mitigation plan within 48 hours of discovery, from M2 acceptance until M4 acceptance; thereafter under the maintenance grant on its terms.
- **Community PRs:** Reviewed within 10 business days, by Brickken from M1 until M4 acceptance, thereafter under the maintenance grant.
- **Documentation:** Updated within 5 business days of any breaking change.

### Track Record

Brickken has participated in the community work of bringing an open technical standard from specification through to independent ecosystem implementation. [ERC-7943](https://eips.ethereum.org/EIPS/eip-7943), known as uRWA, is a Final Standards Track ERC defining common interfaces for compliance checks, transfer controls, asset freezing and enforcement actions on tokenized real-world assets. It was co-authored by Dario Lo Buglio, with Tino Martinez Molina and Mihai Colceriu, and developed with the support of a coalition of RWA infrastructure providers ([third-party implementations and support](#third-party-implementation-and-support-of-erc-7943)).

This proposal brings that work to Canton. uRWA settled which controls a regulated token needs, so rather than reopening the question this proposal reuses the answer and derives the mechanisms from Canton's own authorisation and privacy model, which is what the design points above are about. Brickken has helped bring a regulated asset standard from draft to Final and into implementations by parties other than itself, and proposes to do the same here.

### Adoption Validation

The grant funds direct engineering collaboration with active RWA issuers tokenizing real assets on Canton: two with different use cases on TestNet by M2, the same two in production by M3, and 5+ white-label deployments on MainNet by M4. These integrations inform specification refinements during M2–M3, so the standard reflects what issuers actually require. Findings feed back into the SDK and the conformance suite.

## Co-Marketing

Upon release, Brickken will collaborate with the Foundation on announcement coordination, a technical write-up of the enforcement model and its derivation from uRWA, and developer-facing material (integration guides and conformance examples) for the ecosystem channels.

## References

- [CIP-0000: CIP Process](https://github.com/canton-foundation/cips/blob/main/cip-0000/cip-0000.md)
- [CIP-0056: Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0082: Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100: Governance of the CIP-0082 Development Fund](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP-0112: Token Standard V2](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [CIP-0119: Free Canton Coin Transfer-Preapproval Base Duration](https://github.com/canton-foundation/cips/blob/main/cip-0119/cip-0119.md)
- [ERC-7943: uRWA, Universal Real World Asset Interface](https://eips.ethereum.org/EIPS/eip-7943) (Final)
- [SEC Regulation D, 17 CFR Part 230 Subpart D](https://www.ecfr.gov/current/title-17/chapter-II/part-230/subpart-D)
- [Directive 2014/65/EU (MiFID II)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014L0065)
- [Swiss DLT Act (Federal Act on the Adaptation of Federal Law to Developments with Distributed Ledger Technology)](https://www.fedlex.admin.ch/eli/cc/2020/269/en)
- [Canton Documentation](https://docs.canton.network/)

### Third-party implementation and support of ERC-7943

- [OpenZeppelin Community Contracts Reference Implementation](https://github.com/OpenZeppelin/openzeppelin-community-contracts/blob/master/contracts/token/ERC20/extensions/ERC20uRWA.sol)
- [CMTAT Solidity implementation](https://cmta.ch/news-articles/cmtat-solidity-implementation-adds-support-for-erc-7943)
- [Zoth](https://x.com/zothdotio/status/1967505646800310311)
- [Hacken](https://x.com/hackenclub/status/1966178497334071365)
- [Compellio](https://x.com/compellio/status/1965784955008799067)

## Copyright

Copyright of this document is waived, and the subject matter is dedicated to the public under the [CC0-1.0 Universal License](https://creativecommons.org/publicdomain/zero/1.0/).
Code in the reference implementation is licensed under [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).