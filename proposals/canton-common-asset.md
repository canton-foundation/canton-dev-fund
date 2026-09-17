# [PROPOSAL] Canton-Common-Asset (CCA) — Standardized Infrastructure for RWA & Institutional Lending

- **Author:** Raju Kumar
- **Status:** Proposed
- **Created:** 2026-04-20
- **Contact:** mokamehraju@gmail.com

***

## Abstract

The Canton Network's privacy-preserving, sub-transaction-isolated architecture is uniquely suited
for institutional-grade Real World Asset (RWA) tokenization and secured lending workflows. However,
the ecosystem currently suffers from a critical structural deficit: every project that tokenizes a
bond, private credit instrument, or real-estate tranche re-implements its own bespoke asset
representation, encumbrance logic, and collateral lifecycle from scratch. There is no shared
interface contract, no canonical Lock/Unlock pattern, and no standard atomic-transfer primitive
that separate Canton applications can compose across Sync Domain boundaries.

**Canton-Common-Asset (CCA)** is an open-source, Apache 2.0–licensed **Daml Interface Library**
that delivers the fundamental building blocks for any Canton application targeting RWA tokenization
or institutional collateralized lending. It defines:

1. **`IAsset` & `ILockedAsset` Daml Interfaces:** A typed, implementation-agnostic surface that
   any concrete asset template (bond, equity, real-estate token, commodity receipt) can satisfy,
   enabling polymorphic composition across Canton packages without shared template dependencies.
2. **Encumbrance Engine:** A formally-modeled Lock/Unlock/Liquidate lifecycle for collateral
   encumbrance — the core primitive missing from the Canton ecosystem today — with support for
   partial-encumbrance, haircut parameters, and margin-call hooks.
3. **Atomic Multi-Leg Transfer Engine:** A composable Delivery-versus-Payment (DvP) primitive built
   on Canton's native `Archive`/`Create` transaction atomicity, enabling T+0 settlement of
   collateralized positions across participant nodes.
4. **`ILendingAgreement` Interface:** A standardized representation of a secured lending
   relationship, encoding ISDA-aligned term parameters (principal, spread, maturity, collateral
   schedule, default waterfall) as typed Daml record fields.

All grant-funded components are published as open-source (Apache 2.0), versioned on GitHub, and
designed as reusable, upgrade-compatible primitives for any Canton participant, digital-asset bank,
or independent software vendor building on the Canton Network.

***

## Specification

### 1. Objective

#### The Core Problem

Canton's institutional adoption is accelerating, but the RWA and lending application layer has
fragmented into a collection of siloed, incompatible implementations. This fragmentation creates
three compounding bottlenecks:

| Problem | Description | Institutional Impact |
| :--- | :--- | :--- |
| **Interface Fragmentation** | Every Canton RWA project defines its own asset template with incompatible field layouts, choice signatures, and signatory models. There is no shared `IAsset` interface. | Two institutions running different Canton applications cannot compose their asset contracts in a single atomic transaction without bespoke adapter code. Interoperability cost grows as O(n²) with the number of integration pairs. |
| **Missing Encumbrance Primitive** | There is no canonical Lock/Unlock pattern in the Canton ecosystem. Each lending application implements its own collateral-hold logic, leading to correctness divergences, untested edge cases (partial unlock, over-collateralization), and duplicated audit surface. | Institutional lenders cannot rely on a standard, audited encumbrance mechanism. Every bespoke implementation must be independently reviewed, increasing time-to-market and legal risk. |
| **Non-Atomic Collateral Lifecycle** | Without a shared collateral primitive, multi-leg workflows (pledge collateral, draw loan, margin call, repay, release) are implemented as separate transactions. Non-atomicity creates settlement-risk windows where collateral is pledged but the loan disbursement fails, or vice versa. | Systemic risk: a failed leg in a non-atomic collateral workflow can leave the ledger in an inconsistent state. Under Canton's sub-transaction privacy model, counterparties cannot observe the inconsistency in real time. |

#### The Intended Outcome

CCA produces a complete, open-source, Canton-native base layer that eliminates all three problems.
It is not an application — it is the shared protocol layer *on top of which* RWA applications are
built. The intended outcome is an ecosystem where:

- Any Canton asset template can be treated as an `IAsset` by any CCA-compatible lending application.
- The Lock/Unlock encumbrance lifecycle has a single, audited, formally-specified implementation.
- Multi-leg collateral workflows are atomic by construction, not by convention.

***

### 2. Implementation Mechanics

#### 2.1 Architecture Overview

CCA is a **two-tier, purely on-ledger Daml library** with an optional off-chain reference
integration harness. It does not require off-chain services for its core functionality; all
critical logic runs inside Canton's deterministic Daml execution engine.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER  (CCA consumers: RWA platforms, lending desks, DEXs)       │
│  BondLendingApp  │  RealEstateDvP  │  PrivateCreditFund  │  CCA-Demo         │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │ imports CCA interfaces; provides concrete impls
┌──────────────────────────────▼───────────────────────────────────────────────┐
│ CCA INTERFACE LAYER  (this project — open-source Daml package)               │
│                                                                              │
│  IAsset           ILockedAsset          ILendingAgreement                    │
│  ITransferable    IEncumberable         ICollateralSchedule                  │
│  AtomicDvP        EncumbranceEngine     MarginCallHook                       │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │ Canton Ledger API (gRPC v2, submitAndWait)
┌──────────────────────────────▼───────────────────────────────────────────────┐
│ CANTON PROTOCOL LAYER  (unchanged — Canton Network, Daml runtime)            │
│  Sub-transaction privacy │ Sync Domain │ Participant Node │ DAR packaging    │
└──────────────────────────────────────────────────────────────────────────────┘
```

The CCA library occupies the **Interface Layer** exclusively. It introduces no modifications to
the Canton protocol. Concrete asset templates (e.g., `BondAsset`, `RealEstateTranche`) are
implemented by downstream applications and registered as interface instances of `IAsset` at
compile time.

#### 2.2 The `IAsset` Daml Interface

The cornerstone of the CCA library is `IAsset`: a typed, implementation-agnostic Daml interface
that any Canton asset template satisfies. Consuming applications program to the interface, not the
concrete template, achieving **structural polymorphism** across DAR package boundaries — a pattern
currently unavailable in the Canton ecosystem due to the absence of a canonical standard.

**`AssetView` and supporting data types:**

```daml
module Canton.CCA.Interface.Asset where

data AssetClass
  = GovernmentBond
  | CorporateBond
  | ListedEquity
  | PrivateCreditNote
  | RealEstateTranche
  | CommodityReceipt
  | MoneyMarketInstrument
  deriving (Eq, Show, Ord)

data Jurisdiction = Jurisdiction
  with
    countryCode : Text   -- ISO 3166-1 alpha-2
    legalEntity : Text   -- LEI (20-char ISO 17442)
  deriving (Eq, Show)

data AssetMetadata = AssetMetadata
  with
    issuer       : Party
    isin         : Text           -- ISO 6166 ISIN (12 chars)
    currency     : Text           -- ISO 4217 (e.g., "USD", "EUR")
    faceValue    : Decimal
    maturityDate : Optional Date
    jurisdiction : Jurisdiction
    custodian    : Optional Party
  deriving (Eq, Show)

data AssetView = AssetView
  with
    owner      : Party
    assetId    : Text
    assetClass : AssetClass
    quantity   : Decimal
    metadata   : AssetMetadata
    encumbered : Bool
  deriving (Eq, Show)
```

**`IAsset` interface definition:**

```daml
interface IAsset where
  viewtype AssetView

  -- Non-consuming read: any authorized observer may inspect the asset view.
  nonconsuming choice GetView : AssetView
    controller (view this).owner
    do pure (view this)

  -- Bilateral transfer: archives current instance, creates new owner's instance.
  -- Atomicity is guaranteed by Canton's single-transaction Archive+Create semantics.
  choice Transfer : ContractId IAsset
    with
      recipient    : Party
      transferMemo : Text
    controller (view this).owner
    do
      assertMsg "Cannot transfer an encumbered asset" (not (view this).encumbered)
      error "Transfer: must be implemented by the concrete asset template"

  -- Lock: transitions the asset into an encumbered (ILockedAsset) state.
  -- This is the canonical collateral-pledge primitive for institutional lending.
  choice Lock : ContractId ILockedAsset
    with
      lender              : Party
      loanId              : Text
      collateralValue     : Decimal   -- agreed mark-to-market valuation at pledge time
      haircut             : Decimal   -- e.g., 0.05 → eligible value = collateralValue * (1 - haircut)
      encumbranceExpiry   : Time      -- maximum lock duration (force-release deadline)
      marginCallThreshold : Decimal   -- LTV ratio triggering a MarginCallHook event
    controller (view this).owner
    do
      assertMsg "Asset is already encumbered"          (not (view this).encumbered)
      assertMsg "Haircut must be in range [0, 1)"      (haircut >= 0.0 && haircut < 1.0)
      assertMsg "collateralValue must be positive"     (collateralValue > 0.0)
      error "Lock: must be implemented by the concrete asset template"
```

#### 2.3 The `ILockedAsset` Interface and Encumbrance Engine

`ILockedAsset` represents an asset pledged as collateral. It is the counterpart to `IAsset`; the
two interfaces together model the complete **encumbrance state machine**:

```
IAsset (encumbered=False)
         │
         └──[Lock]──▶ ILockedAsset ──[Unlock]────▶ IAsset (encumbered=False, owner=borrower)
                           │
                           ├──[Liquidate]──────────▶ IAsset (encumbered=False, owner=lender)
                           │
                           └──[MarginCall]─────────▶ MarginCallEvent (on-ledger notification)
```

**`LockedAssetView` and `ILockedAsset` definition:**

```daml
module Canton.CCA.Interface.LockedAsset where

import Canton.CCA.Interface.Asset

data LoanRepaymentProof = LoanRepaymentProof
  with
    loanId          : Text
    repaidPrincipal : Decimal
    repaidInterest  : Decimal
    repaymentTxId   : Text
    repaidAt        : Time
  deriving (Eq, Show)

data LockedAssetView = LockedAssetView
  with
    underlyingOwner     : Party
    lender              : Party
    loanId              : Text
    collateralValue     : Decimal
    haircut             : Decimal
    eligibleValue       : Decimal   -- = collateralValue * (1 - haircut)
    encumbranceExpiry   : Time
    marginCallThreshold : Decimal
    lockedAt            : Time
  deriving (Eq, Show)

interface ILockedAsset where
  viewtype LockedAssetView

  nonconsuming choice GetLockedView : LockedAssetView
    controller (view this).lender
    do pure (view this)

  -- Unlock: lender releases collateral upon full loan repayment.
  -- Consuming: archives ILockedAsset, creates IAsset for the original owner.
  choice Unlock : ContractId IAsset
    with proof : LoanRepaymentProof
    controller (view this).lender
    do
      let v = view this
      assertMsg "Loan ID mismatch on repayment proof"    (proof.loanId == v.loanId)
      assertMsg "Repaid principal insufficient to unlock" (proof.repaidPrincipal >= v.eligibleValue)
      error "Unlock: must be implemented by the concrete locked-asset template"

  -- Liquidate: lender seizes collateral upon borrower default.
  -- Consuming: archives ILockedAsset, transfers IAsset ownership to the lender.
  choice Liquidate : ContractId IAsset
    with
      defaultEvidence : Text   -- references an on-chain DefaultNotice contract ID
    controller (view this).lender
    do
      error "Liquidate: must be implemented by the concrete locked-asset template"

  -- MarginCall: emits an on-ledger MarginCallEvent when current LTV breaches threshold.
  -- Non-consuming: the lock persists; only the event record is created.
  nonconsuming choice MarginCall : ContractId MarginCallEvent
    with
      currentMtMValue : Decimal   -- current mark-to-market (provided by valuation oracle)
      oracleSignature : Text
    controller (view this).lender
    do
      let v = view this
      let currentLtv = v.eligibleValue / currentMtMValue
      assertMsg "LTV is within threshold; margin call not warranted"
                (currentLtv < v.marginCallThreshold)
      create MarginCallEvent with
        loanId              = v.loanId
        lender              = v.lender
        borrower            = v.underlyingOwner
        collateralValue     = v.collateralValue
        currentMtMValue     = currentMtMValue
        currentLtv          = currentLtv
        marginCallThreshold = v.marginCallThreshold
        issuedAt            = error "getTime wired in shipped package"
```

#### 2.4 The `ILendingAgreement` Interface

`ILendingAgreement` standardizes the bilateral term sheet of a secured lending transaction. It
encodes the economic parameters of the loan alongside a reference to the pledged `ILockedAsset`
contract, enabling the Encumbrance Engine to enforce collateral obligations as first-class Daml
choice pre-conditions — not off-chain business logic.

```daml
module Canton.CCA.Interface.LendingAgreement where

import Canton.CCA.Interface.LockedAsset

data RepaymentScheduleType
  = BulletMaturity
  | AmortizingFixed
  | FloatingRateReset   -- e.g., SOFR + spread, reset quarterly
  deriving (Eq, Show)

data LendingTerms = LendingTerms
  with
    principalAmount   : Decimal
    currency          : Text
    interestRateBps   : Int           -- basis points; e.g., 450 = 4.50% p.a.
    floatingBenchmark : Optional Text -- "SOFR", "EURIBOR_3M", or None for fixed rate
    maturityDate      : Date
    repaymentSchedule : RepaymentScheduleType
    gracePeriodDays   : Int
    defaultWaterfall  : [Text]        -- ordered list of collateral IDs to liquidate first
  deriving (Eq, Show)

data AgreementStatus = Active | DefaultNoticed | Repaid | Liquidated
  deriving (Eq, Show)

data LendingAgreementView = LendingAgreementView
  with
    lender              : Party
    borrower            : Party
    terms               : LendingTerms
    lockedCollateralCid : ContractId ILockedAsset
    agreementId         : Text
    executedAt          : Time
    status              : AgreementStatus
  deriving (Eq, Show)

interface ILendingAgreement where
  viewtype LendingAgreementView

  nonconsuming choice GetAgreementView : LendingAgreementView
    controller (view this).lender
    do pure (view this)

  -- Drawdown: releases principal to borrower against locked collateral.
  choice Drawdown : (ContractId ILendingAgreement, ContractId IAsset)
    with disbursementAssetCid : ContractId IAsset
    controller (view this).lender
    do error "Drawdown: concrete impl verifies collateral CID before releasing funds"

  -- Repay: borrower submits repayment proof, triggers Unlock on collateral.
  choice Repay : ContractId IAsset
    with repaymentProof : LoanRepaymentProof
    controller (view this).borrower
    do error "Repay: concrete impl exercises Unlock on ILockedAsset"

  -- DeclareDefault: lender records a default event and initiates liquidation waterfall.
  choice DeclareDefault : ContractId IAsset
    with defaultReason : Text
    controller (view this).lender
    do error "DeclareDefault: concrete impl exercises Liquidate on ILockedAsset"
```

#### 2.5 Atomic Multi-Leg Transfer Engine (DvP)

The CCA `AtomicDvP` template provides the canonical Delivery-versus-Payment primitive for Canton.
It wraps two `IAsset` transfer legs in a **single Canton transaction**, exploiting Canton's
`Archive`/`Create` atomicity guarantee to eliminate the settlement-risk window inherent in
sequential transfer approaches.

```
Borrower                      Canton Ledger (single atomic tx)                Lender
   │                                                                             │
   │── Exercise AtomicDvP.Settle ──▶ [1] Archive Borrower.AssetCid (delivery)    │
   │                                  [2] Create Asset (owner = Lender)          │
   │                                  [3] Archive Lender.CashCid  (payment)      │
   │                                  [4] Create Cash  (owner = Borrower)        │
   │◀──────────────────────────────── (all four ops atomic; none partial) ───────│
```

```daml
template AtomicDvP
  with
    initiator      : Party
    responder      : Party
    deliveryCid    : ContractId IAsset   -- asset leg (e.g., bond token)
    paymentCid     : ContractId IAsset   -- cash leg  (e.g., tokenized USD)
    agreedPrice    : Decimal
    settlementDate : Time
    dvpId          : Text
  where
    signatory initiator
    observer  responder

    -- Settle: both Transfer exercises occur inside a single Daml `do` block.
    -- Canton's transaction model guarantees full atomicity: both legs succeed or neither does.
    choice Settle : (ContractId IAsset, ContractId IAsset)
      controller responder
      do
        now <- getTime
        assertMsg "Settlement window has expired" (now <= settlementDate)
        deliveredCid <- exercise deliveryCid Transfer with
          recipient    = responder
          transferMemo = "CCA DvP: delivery leg | dvpId=" <> dvpId
        paidCid <- exercise paymentCid Transfer with
          recipient    = initiator
          transferMemo = "CCA DvP: payment leg  | dvpId=" <> dvpId
        pure (deliveredCid, paidCid)

    choice CancelDvP : ()
      with cancellationReason : Text
      controller initiator
      do
        now <- getTime
        assertMsg "Cannot cancel after settlement date" (now < settlementDate)
        pure ()
```

#### 2.6 Concrete Reference Implementation: `BondAsset`

The CCA library ships a **reference concrete implementation** (`BondAsset` template) that satisfies
both `IAsset` and `ILockedAsset`, demonstrating the correct `interface instance` pattern and
serving as a verified reference for downstream implementors.

```daml
module Canton.CCA.Reference.BondAsset where

import Canton.CCA.Interface.Asset
import Canton.CCA.Interface.LockedAsset

template BondAsset
  with
    owner     : Party
    issuer    : Party
    isin      : Text
    faceValue : Decimal
    currency  : Text
    maturity  : Date
    custodian : Party
  where
    signatory issuer
    observer  owner, custodian

    interface instance IAsset for BondAsset where
      view = AssetView with
        owner      = owner
        assetId    = isin
        assetClass = CorporateBond
        quantity   = faceValue
        encumbered = False
        metadata   = AssetMetadata with
          issuer       = issuer
          isin         = isin
          currency     = currency
          faceValue    = faceValue
          maturityDate = Some maturity
          jurisdiction = Jurisdiction with
            countryCode = "US"
            legalEntity = "549300EXAMPLE00LEI1"
          custodian    = Some custodian

      choice Transfer : ContractId IAsset
        with recipient : Party; transferMemo : Text
        controller owner
        do
          newCid <- create this with owner = recipient
          pure (toInterfaceContractId @IAsset newCid)

      choice Lock : ContractId ILockedAsset
        with
          lender : Party; loanId : Text
          collateralValue : Decimal; haircut : Decimal
          encumbranceExpiry : Time; marginCallThreshold : Decimal
        controller owner
        do
          lockedCid <- create LockedBondAsset with
            underlyingOwner     = owner
            bondIsin            = isin
            issuer              = issuer
            faceValue           = faceValue
            currency            = currency
            lender              = lender
            loanId              = loanId
            collateralValue     = collateralValue
            haircut             = haircut
            eligibleValue       = collateralValue * (1.0 - haircut)
            encumbranceExpiry   = encumbranceExpiry
            marginCallThreshold = marginCallThreshold
            lockedAt            = error "getTime resolved in shipped package"
          pure (toInterfaceContractId @ILockedAsset lockedCid)
```

***

### 3. Architectural Alignment

| Principle | CCA's Approach |
| :--- | :--- |
| **Daml Interface Model** | All CCA primitives are defined as Daml 2.x `interface` types. Consuming templates program to `IAsset`, `ILockedAsset`, and `ILendingAgreement` — not to concrete templates. This is the correct extensibility pattern for cross-package composition on Canton. |
| **Sub-Transaction Privacy** | The `IAsset` interface's `signatory`/`observer` layout preserves Canton's party-scoped visibility. The lender is added as an `observer` on `ILockedAsset` only after `Lock` is exercised — the lender never becomes a stakeholder of the underlying `IAsset` before the pledge. Private position data remains invisible to unauthorized parties. |
| **Canton Transaction Atomicity** | The `AtomicDvP` template and all Lock/Unlock choices exploit Canton's `Archive`+`Create` single-transaction atomicity. No escrow intermediary, no two-phase commit, and no off-chain coordination is required for atomic settlement. |
| **Ledger API Compatibility** | All CCA template choices are exercisable via the standard Canton gRPC Ledger API v2 (`CommandServiceGrpc.submitAndWait`, `QueryServiceGrpc.getActiveContracts`). No extensions to the Canton participant node are required. |
| **Upgrade Compatibility** | CCA follows Canton's DAR upgrade guidelines: interface contracts are defined in a separate `cca-interfaces` package and concrete reference implementations in `cca-reference`. Downstream adopters upgrade the reference package without breaking the interface package. |
| **Governance Alignment** | Submitted under CIP-0082 (Development Fund) and governed by CIP-0100. Interface specifications are proposed as candidate Canton Ecosystem Standards for community ratification post-delivery. |

**Relationship to Existing Canton Primitives:**

CCA does not replace or modify any Canton protocol component. It builds on:

- Canton's native `Archive`/`Create` transaction semantics for atomic DvP and encumbrance transitions.
- Canton's `Party`-based `signatory`/`observer` authorization model for collateral-hold visibility.
- Canton's Daml 2.x `interface` / `interface instance` mechanism for polymorphic template composition.
- Canton's existing DAR packaging and upgrade model for versioned library distribution.

***

### 4. Backward Compatibility

CCA is entirely additive. It introduces new Daml interface definitions and template implementations.
It does not:

- Modify any Canton protocol parameters, consensus rules, or Sync Domain configuration.
- Change any Daml SDK APIs or the Canton Ledger API gRPC surface.
- Require Canton participant node upgrades.
- Impose any runtime dependency on existing Canton applications that do not opt in.

Existing Canton RWA projects can adopt CCA incrementally by implementing `IAsset` as an additional
`interface instance` on their existing templates. No migration of existing contract instances is
required; the interface instance is a compile-time declaration, not a ledger migration.

***

## Milestones and Deliverables

Grant-funded delivery runs **M1 through M3** over **12 weeks (~three months)** from grant approval:
**three milestones, each allocated a 4-week window**. Scope is split as **(1)** Interface Design &
Core Logic, **(2)** Institutional Lending & Collateral Hooks, **(3)** Technical Documentation &
Demo Application.

**Payment timing (explicit):** **M1 funds (180,000 CC) are disbursed on grant approval and executed
agreement — before M1 work is complete — so the team can start immediately.** When M1 work is
complete, the Committee reviews and accepts M1 (target: end of week 4). **M2 (240,000 CC)** is paid
only after both M1 and M2 are accepted by the Committee. **M3 (280,000 CC)** is paid only after
acceptance of M3. **Total request: 700,000 CC (per CIP-0100).** Failure to meet a milestone after
the upfront tranche is handled per standard Development Fund terms.

### Milestone 1: Interface Design & Core Logic _(Weeks 1 to 4)_

- **Estimated Delivery:** target **M1 acceptance review** by **end of week 4** from grant approval
- **Focus:** Complete Daml interface specification (`IAsset`, `ILockedAsset`, `ITransferable`,
  `IEncumberable`), core type definitions, `BondAsset` reference implementation, `AtomicDvP`
  template, and ecosystem foundations (public repo, CI, DAR scaffold)
- **Deliverables / Value Metrics:**
  - **CCA Interface Package (`cca-interfaces`):** Open-source Daml package containing `IAsset`,
    `ILockedAsset`, `ITransferable`, `IEncumberable`, `ILendingAgreement`, `AtomicDvP`, and all
    supporting data types (`AssetView`, `LockedAssetView`, `AssetClass`, `AssetMetadata`,
    `Jurisdiction`, `LendingTerms`). Apache 2.0, published to GitHub.
  - **Reference Implementation Package (`cca-reference`):** `BondAsset` and `LockedBondAsset`
    concrete templates satisfying `IAsset` and `ILockedAsset`; includes `interface instance`
    declarations with fully implemented `Transfer` and `Lock` choices.
  - **`AtomicDvP` Template:** Atomic two-leg Delivery-versus-Payment contract with `Settle` and
    `CancelDvP` choices; Canton Sandbox integration test demonstrating atomic settlement (both legs
    succeed) and atomic rollback (one leg fails → neither executes).
  - Complete Daml Script unit test suite for all interface instances and the `AtomicDvP` template
    (Canton Sandbox). Minimum 95% choice-path coverage.
  - **Ecosystem (M1 slice):** Public GitHub org/repo, Apache 2.0 license, GitHub Actions CI
    (`daml build`, `daml test` on push), DAR versioning policy, initial `CHANGELOG.md`.
  - Developer documentation: interface reference (all choice signatures, pre-conditions,
    post-conditions), `BondAsset` implementation guide, Daml Script quickstart.
  - **Value Metric:** A developer can import `cca-interfaces`, implement `IAsset` on a custom
    template, and exercise a `Lock` choice on Canton Sandbox in **under 30 minutes** following
    the published quickstart.

### Milestone 2: Institutional Lending & Collateral Hooks _(Weeks 5 to 8)_

- **Estimated Delivery:** target **M2 acceptance review** by **end of week 8** from grant approval
  (four working weeks after M1 acceptance)
- **Focus:** `ILendingAgreement` concrete implementation, full encumbrance lifecycle
  (Lock → MarginCall → Unlock / Liquidate), collateral haircut engine, and Canton Testnet deployment
- **Deliverables / Value Metrics:**
  - **`SecuredLendingAgreement` Template:** Concrete implementation of `ILendingAgreement` encoding
    `LendingTerms` (principal, rate in BPS, floating-rate benchmark, maturity, repayment schedule,
    default waterfall). Choices: `Drawdown`, `Repay`, `DeclareDefault` — each wired to the
    corresponding `ILockedAsset` choice via Canton's interface exercise mechanism.
  - **Collateral Haircut Engine:** `HaircutSchedule` Daml template encoding asset-class–specific
    haircut parameters (GovernmentBond: 2%, CorporateBond: 5–8%, RealEstateTranche: 15%).
    `IEncumberable.Lock` pre-condition validates haircut against the active `HaircutSchedule`
    contract for the asset class before accepting a collateral pledge.
  - **`MarginCallHook` & `MarginCallEvent` Templates:** `MarginCallHook` is a standing contract a
    lender deploys to monitor an active `ILockedAsset` position. When the current mark-to-market
    (provided via a Canton oracle disclosure pattern) breaches `marginCallThreshold`, a
    `MarginCallEvent` contract is created on-ledger as an auditable notification primitive.
  - **`DefaultNotice` Template:** Lender-signatured on-chain record of borrower default, referenced
    by `ILockedAsset.Liquidate` as the `defaultEvidence` field. Enforces `gracePeriodDays`
    cool-down before liquidation is permitted.
  - Full end-to-end lending lifecycle on **Canton Testnet**: pledge collateral (`Lock`), draw down
    principal (`Drawdown`), trigger margin call (`MarginCall`), repay (`Repay` → `Unlock`), and
    confirm `IAsset` returned to borrower — demonstrated with two Canton Testnet parties.
  - Daml Script integration tests on Testnet covering the full lifecycle including adversarial
    cases: attempted double-lock, premature liquidation, grace period enforcement.
  - **Ecosystem (M2 slice):** npm-scoped TypeScript client scaffold (`@canton-cca/client`) with
    typed wrappers for `IAsset` and `ILockedAsset` Ledger API interactions; pre-release npm publish.
  - **Value Metric:** Full Lock → Drawdown → MarginCall → Repay → Unlock lifecycle executes
    end-to-end on **Canton Testnet** in a single scripted run; all five choices confirmed on-ledger
    with zero partial-state inconsistencies.

### Milestone 3: Technical Documentation & Demo Application _(Weeks 9 to 12)_

- **Estimated Delivery:** target **M3 acceptance review** by **end of week 12** from grant approval
  (four working weeks after M2 acceptance)
- **Focus:** Developer documentation site, CCA Demo Application (Next.js 14), Canton Mainnet
  deployment, `@canton-cca/client` GA SDK, and ecosystem handoff
- **Deliverables / Value Metrics:**
  - **CCA Demo Application (Next.js 14):** Interactive, open-source reference application
    demonstrating the complete CCA interface stack:
    - *Asset Registry view:* lists active `IAsset` contracts for the logged-in Canton party.
    - *Collateral Manager view:* initiate a `Lock`, view active `ILockedAsset` positions,
      trigger `MarginCall`, execute `Unlock` / `Liquidate`.
    - *Lending Desk view:* create `SecuredLendingAgreement`, execute `Drawdown`, `Repay`,
      `DeclareDefault`.
    - *DvP Settlement view:* construct `AtomicDvP`, counterparty `Settle`, real-time confirmation.
    - Institutional dark-mode UI; responsive; Canton Ledger API integration via
      `@canton-cca/client`.
  - **`@canton-cca/client` GA SDK:** TypeScript SDK with typed Ledger API helpers for all CCA
    choices, contract queries, and event subscriptions. Includes JSDoc, hosted API reference, and
    example integration scripts. Stable npm publish (1.x line).
  - **Technical Documentation Site (GitHub Pages / Docusaurus):**
    - Interface specification v1.0 (all choices, pre-conditions, invariants, signatory/observer
      rationale).
    - Implementor's guide: how to satisfy `IAsset` on a custom Canton template.
    - `AtomicDvP` cookbook: T+0 settlement patterns, failure modes, and idempotency guidance.
    - Lending lifecycle walkthrough with annotated Daml Script traces.
    - Canton Testnet → Mainnet migration guide.
  - **Canton Mainnet Deployment:** All CCA DAR packages (`cca-interfaces`, `cca-reference`) and the
    Demo Application deployed to **Canton Mainnet**; smoke verification documented with at least one
    live Lock → Unlock cycle on-chain.
  - **Security Self-Assessment:** Daml authorization model review (signatory correctness, controller
    minimality), choice pre-condition completeness, Canton upgrade compatibility checklist —
    documented and published.
  - **Ecosystem handoff:** tagged GitHub release (v1.0.0), community announcement draft, Canton
    ecosystem registry submission for `cca-interfaces` DAR.
  - **Value Metric:** A new Canton developer follows the published quickstart, deploys the Demo
    Application against Canton Sandbox or Testnet, and completes a full Lock → Unlock collateral
    cycle in **under 15 minutes**.

***

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **Reference environment:** Latency and quickstart metrics are measured in a documented reference
  environment (machine profile, Canton SDK version, Testnet endpoint) published with the test plan.
- All deliverables completed as specified for each milestone.
- Demonstrated, reproducible functionality on **Canton Testnet** through M2; **M3** additionally
  demonstrates **Mainnet** deployment as specified.
- All Daml templates pass Canton Sandbox unit tests and Testnet integration tests with **zero
  critical defects** (defined as: unintended partial asset transfer, encumbrance escape, or
  unauthorized Unlock / Liquidate).
- Documentation and knowledge transfer provided (interface reference, implementor guide, hosted API
  docs by M3).
- Open-source release: all grant-funded code under Apache 2.0 on a public GitHub repository.

**Project-Specific Acceptance Conditions:**

| Condition | Milestone | Pass Criteria |
| :--- | :--- | :--- |
| Interface package compiles cleanly | M1 | `daml build` on `cca-interfaces` succeeds with zero warnings on Daml SDK ≥ 3.0 |
| `BondAsset` satisfies `IAsset` | M1 | All `IAsset` interface instance choices are exercisable via Daml Script on Canton Sandbox |
| Atomic DvP correctness | M1 | In a simulated single-leg failure (pre-condition assert on payment leg), neither leg executes; Sandbox state unchanged |
| Lock / Unlock round-trip | M2 | `Lock` followed by `Repay` → `Unlock` returns `IAsset` to original owner with `encumbered = False` on Testnet |
| MarginCall threshold enforcement | M2 | `MarginCall` choice succeeds only when current LTV < `marginCallThreshold`; reverts otherwise (100/100 deterministic runs) |
| Haircut engine correctness | M2 | `Lock` pre-condition rejects collateral pledges where `haircut` violates the active `HaircutSchedule` for the asset class |
| Default waterfall ordering | M2 | `DeclareDefault` exercises `Liquidate` in `defaultWaterfall` order; documented in test trace |
| Demo App quickstart | M3 | New developer completes Lock → Unlock cycle on Canton Sandbox / Testnet using published quickstart in **under 15 minutes** |
| Mainnet deployment | M3 | `cca-interfaces` and `cca-reference` DARs deployed on Canton Mainnet; smoke Lock / Unlock verified and documented |

***

## Funding

**Total Funding Request: 700,000 CC**

### Payment Breakdown by Milestone

**700,000 CC** in **three tranches**: **180,000 + 240,000 + 280,000 CC**. **M1 (180,000 CC) is
disbursed on grant approval and executed agreement — upfront, before M1 completion.** M2
(240,000 CC) is paid only after both M1 and M2 are accepted by the Committee. M3 (280,000 CC)
after M3 acceptance. The programme is paced as **three consecutive 4-week windows (12 weeks
total, ~three months)** from grant approval.

| Milestone | Scope (summary) | Target window (from grant approval) | CC amount | When paid |
| :--- | :--- | :--- | :--- | :--- |
| M1 | Interface Design: `IAsset`, `ILockedAsset`, `AtomicDvP`, `BondAsset` reference impl, Sandbox tests, repo + CI | Weeks 1–4 | **180,000 CC** | **On grant approval / executed agreement** (upfront) |
| M2 | Institutional Lending: `ILendingAgreement`, `SecuredLendingAgreement`, haircut engine, `MarginCallHook`, `DefaultNotice`, full lifecycle on Testnet | Weeks 5–8 | **240,000 CC** | **After M1 and M2 acceptance** (both milestones must be complete) |
| M3 | Demo App (Next.js 14), GA SDK, documentation site, Mainnet deployment, security checklist, ecosystem release | Weeks 9–12 | **280,000 CC** | **After M3 acceptance** |
| **TOTAL** | | **Weeks 1–12** | **700,000 CC** | |

### Co-Investment

The proposing entity will fund the following independently (not covered by this grant):

- Canton Testnet and Mainnet participant node hosting costs.
- Demo Application production hosting (GitHub Pages for docs; Vercel or equivalent for the
  Next.js app beyond the development preview tier).
- Any optional third-party security audit costs beyond the M3 self-assessment checklist.

***

## Team and Developer Roles

Delivery is structured around **specialist developers** so reviewers can see end-to-end coverage:
**on-ledger logic (Daml / Canton)**, **backend SDK integration**, **institutional frontend**, and
**technical documentation**.

| Role | Primary Ownership | Stack / Notes |
| :--- | :--- | :--- |
| **Daml / Canton Developer** | `cca-interfaces` and `cca-reference` packages: interface definitions, choice design, signatory/observer layout, `interface instance` implementations, `AtomicDvP`, Sandbox and Testnet/Mainnet DAR packaging | Daml SDK ≥ 3.0, Canton Sandbox, Ledger API command shapes, DAR upgrade-compatibility policy |
| **Backend / Integration Engineer** | `@canton-cca/client` TypeScript SDK; Canton Ledger API gRPC v2 client (`submitAndWait`, `getActiveContracts`); Demo App backend; Testnet/Mainnet integration test runner | Node.js / TypeScript, gRPC, `@daml/ledger` client, idempotent command submission patterns |
| **Frontend Engineer** | CCA Demo Application (Next.js 14): Asset Registry, Collateral Manager, Lending Desk, and DvP Settlement views; institutional dark theme; responsive layout; typed `@canton-cca/client` integration | React / Next.js 14, Tailwind CSS, Canton Ledger API via TypeScript SDK |
| **Technical Writer** | Interface specification v1.0; implementor's guide; `AtomicDvP` cookbook; Testnet → Mainnet migration guide; Docusaurus documentation site | Docusaurus v3, GitHub Pages, annotated Daml Script traces |

**How this maps to milestones:** M1 is **Daml-heavy** (interfaces, reference impl, Sandbox tests);
M2 adds **backend + Daml integration** (lending templates, oracle pattern for margin calls, Testnet
deployment); M3 adds **frontend + technical writing** (demo app, docs, Mainnet). Roles may be
shared across contributors or delivered with named contractors; the proposal assumes capacity to
staff each lane for the 12-week programme.

***

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

- **Announcement coordination:** Joint ecosystem blog post announcing the open-source release of
  the CCA Interface Library as a candidate Canton ecosystem standard for RWA and institutional
  lending.
- **Technical blog series:** Two-part series: (1) *"Why Canton Needs a Standard Asset Interface:
  The CCA Approach"* — covering the fragmentation problem and the Daml interface solution; (2)
  *"Building a Collateralized Lending App on Canton in Under 30 Minutes"* — walkthrough using the
  CCA Demo App and `@canton-cca/client` SDK.
- **Developer promotion:** CCA `IAsset` and `ILendingAgreement` interfaces featured in Canton
  developer documentation as the recommended base layer for RWA tokenization projects.
- **Demo:** Live demonstration at a Canton Foundation ecosystem call after **M3 acceptance**
  (Mainnet + Demo App ready; schedule by mutual agreement).
- **Ecosystem Standard Proposal:** CCA interface specifications submitted for consideration as an
  official Canton Improvement Proposal (CIP) defining a canonical asset interface standard for the
  ecosystem.

***

## Motivation

**Why this is valuable to the Canton ecosystem:**

Canton's institutional-grade privacy model and sub-transaction isolation make it the most
technically advanced distributed ledger for RWA and secured lending. However, the application
developer experience today requires every new Canton RWA project to:

1. Design and implement a bespoke asset template from scratch, with no interoperability guarantees.
2. Invent a custom Lock/Unlock encumbrance pattern with no audited reference implementation.
3. Implement collateral lifecycle management (haircuts, margin calls, default waterfalls) as
   application-layer business logic, without on-ledger enforcement.
4. Build their own DvP atomic settlement primitive, re-solving a problem Canton's transaction model
   already supports natively.

This duplication of effort is a structural tax on the Canton ecosystem. Every institution that
tokenizes a bond or implements a repo agreement on Canton is independently solving the same
engineering problems. CCA eliminates this tax by providing a shared, audited, composable base
layer — the Canton equivalent of the OpenZeppelin standard library on Ethereum, but designed
specifically for Canton's interface model, sub-transaction privacy, and institutional-grade
authorization semantics.

**Expected ecosystem impact:**

- Reduces new Canton RWA project time-to-market by eliminating boilerplate interface and encumbrance
  implementation (estimated 4–8 weeks of engineering per project).
- Enables true cross-application composability: a bond tokenized by Application A can be pledged as
  collateral in a lending application built by Application B — without bespoke adapter code —
  because both conform to `IAsset`.
- Establishes a community-ratifiable Canton ecosystem standard for asset interfaces, analogous to
  EIPs on Ethereum.
- Lowers the legal and compliance risk of Canton lending applications by providing a single,
  community-reviewed implementation of the encumbrance lifecycle rather than N bespoke
  implementations with N independent audit scopes.

***

## Rationale

**Why this approach?**

**On Daml Interfaces over Shared Concrete Templates:**
A shared concrete template (e.g., a single `CantonAsset` template that all applications use)
was explicitly rejected. Shared concrete templates create hard coupling between application packages;
a change to the shared template requires all consumers to upgrade simultaneously. Daml 2.x interfaces
decouple the *surface* (what choices a consumer can call) from the *implementation* (how a specific
asset type fulfills those choices). This is the correct abstraction boundary for an ecosystem
standard library.

**On choosing Lock/Unlock over an escrow-account pattern:**
Some Canton lending implementations use a dedicated escrow party account to hold collateral during
a loan's lifetime. This approach introduces an additional party whose authorization is required on
every collateral transition, increasing transaction complexity and creating a single point of
failure. The `ILockedAsset` pattern keeps the asset in the borrower's DAR package context but makes
the lender the sole `controller` of `Unlock` and `Liquidate` choices. This is simpler, cheaper
(fewer transaction signatories), and fully enforced by Canton's authorization model without any
off-ledger escrow coordination.

**On encoding `LendingTerms` in Daml rather than off-chain:**
Off-chain term sheets are not enforceable at the Canton transaction layer. By encoding
`principalAmount`, `interestRateBps`, `gracePeriodDays`, and `defaultWaterfall` as typed Daml
record fields on `ILendingAgreement`, CCA makes the loan's economic parameters first-class
pre-conditions on `Repay` and `DeclareDefault` choices. The ledger enforces the term sheet; there
is no gap between the contractual documentation and the on-chain execution logic.

**On `AtomicDvP` over manual two-leg coordination:**
Canton's `Archive`+`Create` single-transaction semantics guarantee that a multi-output transaction
either fully succeeds or fully reverts. The `AtomicDvP.Settle` choice exploits this by placing both
`Transfer` exercises in a single Daml `do` block submitted as one `submitAndWait` command. No
off-chain coordination, no two-phase commit protocol, and no escrow account are required. This is
the simplest correct implementation of T+0 atomic settlement on Canton.

**On open-source commitment:**
All grant-funded components are Apache 2.0. CCA's commercial differentiation (if any) lies in the
hosted institutional services built on top of the library. The library itself — interfaces, reference
implementations, the Demo App, and the SDK — are public goods for the Canton ecosystem.
