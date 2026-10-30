# Canton Asset Servicing: implementation draft

Coupons, redemptions and corrections on a tokenized security, including one that is pledged, across applications built by different vendors. Companion to the Development Fund proposal. 2026-10-27, PixelPlex.

Written against the token standard as shipped in Splice 0.8.3 (`token-standard/`, `daml/splice-api-token-burn-mint-v1/`) and CIP-0112. The `splice-api-token-*` and burn-mint packages are unchanged through Splice 0.9.4, so every reference below holds there too.

**Build target.** All 24 token-standard `daml.yaml` files (23 under `token-standard/` plus `daml/splice-api-token-burn-mint-v1/`) are `sdk-version: 3.5.2` with `--target=2.1`. Nineteen of the 24 also carry `--explicit-serializable=yes`; the five without it are `allocation-instruction-v1`, `allocation-v1`, `holding-v1`, `metadata-v1` and `transfer-instruction-v1`; `allocation-request-v1`, also V1-generation, carries it. This package takes all three. The constraint decides the arithmetic in §5.2, and `Serializable` as a deriving clause does not exist before SDK 3.5.2.

Code blocks below compile at that target, in two packages: the interfaces in one, and the registry-side template of §4.3 with the §2 helper and the §5.2 expression in another (§4.3 explains why they cannot share a package). Both packages exist as PixelPlex's working prototype, with scripts asserting the §5.4 rounding examples, every rounding direction, the `decimals` range and the 10^18 overflow. The prototype compiles the interfaces and checks the arithmetic; no template implements the interfaces yet. It becomes the starting point of Milestone 2's public repository.

## 1. Goal and non-goals

**Goal.** A registry announces that an instrument pays or redeems, derives who is owed what as of a record time, and pays it. A custodian, a collateral application and a wallet built by three other vendors read the entitlements and redirects from their own participants, and the event terms from the entitlement or the registry's API, without a bilateral integration. The case it must handle is a pledged bond, where the recorded holder is not the party the coupon is owed to.

**Version 1 covers** cash distributions (coupon, dividend, interest), full redemption, redirection of income to a pledgee, payment with a record of what has been paid, and corrections and cancellations before and after payment.

**Extensions beyond version 1.** Each is a separate package on top of this one, proposed separately (§13): holder elections, unit changes (splits, consolidations), partial redemption, allocating a rounding residual against a funded total, securities-lending equivalent payments, and cross-instrument corporate actions (mergers, spin-offs, rights issues). An extension reuses version 1's keys and leaves its interfaces as they are. Anything it needs beyond them, such as a funded total, a unit result or an option set, it carries in interfaces of its own, implemented alongside version 1's on the same contracts.

**Non-goals.** A new payment rail (distributions use the token standard's own allocations and transfers). Tax logic (withholding is a declared input). Valuation and risk parameters (#665). Liquidation mechanics (#232). Legal enforceability of any agreement a redirect points at.

## 2. Actors

| Actor | Is | Does |
| --- | --- | --- |
| Instrument admin | `InstrumentId.admin` (the registry) | announces events, derives entitlements, pays, corrects |
| Holder | account principal of an `Account` holding the instrument | owed the income, unless part of it is redirected |
| Account provider | `Account.provider`, where set (for example a custodian) | already sees its clients' holdings; sees their entitlements and every redirect on their positions |
| Beneficiary | the pledgee | receives redirected income |
| Paying agent | the admin, or a party the admin delegates to | pays and records the payment (§6); a stakeholder of every entitlement it settles |

**Roles are technical.** Each role names what a party does on the ledger, not a licensed function. An account provider is the party in `Account.provider`; a paying agent is the party that exercises `LifecycleEvent_SettleBatch` or `Entitlement_Settle`. Whether a party in either role needs a license is a matter for its jurisdiction, which this standard neither requires nor addresses. Where the text says custodian, it means an account provider acting for its clients.

**Account parties**, throughout, means what the standard's own helper means:

```daml
accountParties : Party -> HoldingV2.Account -> [Party]
accountParties admin account = case account.provider of
    Some provider | provider /= principal -> [principal, provider]
    _ -> [principal]
  where principal = fromOptional admin account.owner
```

The principal (the owner, or the admin for a special account with `owner = None`), plus the provider only where one is set and differs. For a basic account (`basicAccount`, no provider) it is one party. Nothing here may assume a provider exists.

Source: `token-standard/splice-token-standard-utils/daml/Splice/TokenStandard/Utils/Internal/Conversions.daml:147-170`.

## 3. What the standard gives us, and where this attaches

| We reuse | From | Why it matters here |
| --- | --- | --- |
| `Account { owner : Optional Party, provider : Optional Party, id : Text }` | `HoldingV2.daml` | an entitlement is owed *to an account*, so the custody relationship is explicit |
| `InstrumentId { admin, id }` | `HoldingV2.daml` | the admin is the only party that may announce an event |
| `HoldingView { account, instrumentId, amount, lock, meta }` | `HoldingV2.daml` | the derivation input |
| `accountParties` | `TokenStandard/Utils` | the stakeholder rule we adopt for entitlements |
| `cip-112/mint`, `cip-112/burn` accounts | CIP-0112 §4.3.2.1 | redemption is an allocation leg to the burn account; `BurnMintFactory` is not used |
| `SettlementFactory_SettleBatch`, `Allocation`, `TransferFactory_Transfer` | `AllocationV2.daml`, `TransferInstructionV2.daml` | the movements a settlement performs: batched over allocations, or a single transfer (§6) |
| Receipt-only delegation, checked by `ensureIsReceiptAllocation` | `TradingAppV2.daml` (`TradeSettlementAgreement_CreateReceiptAllocation`), `TokenStandard/Utils` | the paying agent creates receipt allocations for the payable accounts (§6) |
| `ExtraArgs { context : ChoiceContext, meta : Metadata }` | `MetadataV1.daml` | registry-provided context fetched over the off-ledger API |
| Factory + `_PublicFetch` + `actors : [Party]` + `availableActions` | `TransferInstructionV2.daml`, `AllocationV2.daml` | the V2 shape wallets already render |
| Metadata keys with a prefix and a name (CIP-0056 key syntax); V2's own keys use the prefix `cip-112/` | CIP-0056, `MetadataV1.daml:57-61`, `Conversions.daml` (`tokenStandardV2Namespace`) | our references use `cip-<nr>/` the same way (§6, §12.1) |

What is missing:

- `Lock` has four fields: `holders : [Party]`, `expiresAt`, `expiresAfter` and `context : Optional Text`, the last documented as wallet display and possibly visible more widely than the contracts it describes. It cannot say which obligation it secures, or who gets the coupon.
- No event, no record time, no entitlement in CIP-0056 or CIP-0112.

**Why the event and its entitlements are not a V2 settlement and its legs.** The shapes are alike: an event names a payment run, entitlements look like its legs, and partial payments and corrections look like settlement iterations. They differ on every point servicing depends on:

- **An allocation is an authorization, not a record.** `Allocation_Settle` archives it, and the next-iteration allocation, if any, carries funding, not history. After settlement no V2 contract states what was owed and what was paid. The entitlement stays live as that statement, with `outstanding` positive, zero or negative.
- **V2 does not say who is entitled.** The executor specifies the legs; `SettlementInfo` is `executors`, `id`, an optional `cid` and `meta`, with no terms. The snapshot at `recordTime`, the per-unit rate and the rounding (§5) have no V2 counterpart.
- **A receipt allocation cannot be iterated.** Iteration has to be enabled when the allocation is created, by setting `nextIterationFunding`, and `ensureIsReceiptAllocation` requires it to be `None`. Each partial payment is therefore its own settlement, and `paidAmount` is what links them.
- **A correction is not an iteration.** An iteration changes legs before money moves. A correction arrives after the money moved and the allocation was archived; it needs the supersession link, `paidAmount` carried over, and a negative `outstanding` when the payment was too large (§7), which no leg can express.
- **A redirect has no counterpart at all.**

Each settlement batch is still a V2 settlement: its `SettlementInfo.id` is built from the event key and the batch number, and its `meta` carries the three reference keys (§6).

Source: `AllocationV2.daml` (`SettlementInfo`, `AllocationSpecification.nextIterationFunding`, `Allocation_Settle`); `Utils/Internal/Allocations.daml` (`ensureIsReceiptAllocation`).

**V1 and V2 conventions differ by design, and we follow V2.** `AllocationV2`'s module header states that V2 "removes the need to specify the `expectedAdmin` party, as its value is already specified in other choice arguments or not relevant (for `_PublicFetch` choices)". V2 packages take `actors : [Party]` and no `expectedAdmin`; V1-generation packages, including `burn-mint-v1`, take `expectedAdmin` and one `actor`. A V2 token carries `interface instance V1.Holding` and `interface instance V2.Holding` on the same template, so one registry serves both generations.

Source: `splice-api-token-allocation-v2/daml/Splice/Api/Token/AllocationV2.daml:18-19`; `examples/splice-test-token-v2/daml/Splice/Testing/Tokens/TestTokenV2/Holding.daml:31-35`.

**`_PublicFetch` belongs on factories only.** All six declarations in 0.8.3 are on factories (`TransferFactory` V1/V2, `AllocationFactory` V1/V2, `SettlementFactory`, `BurnMintFactory`), and `EventLogView`'s doc comment states the rule for data contracts: "`EventLog` contracts do not support public fetching, as they are intended to be used by the instrument admin or app provider only." Our factory carries it; `LifecycleEvent`, `Entitlement` and `EntitlementRedirect` do not. A V2 `_PublicFetch` validates no admin: the caller compares the returned view against its own trusted source of the admin, which V1 had the caller pass in as `expectedAdmin`.

Source: `git grep -n "choice .*_PublicFetch" 0.8.3 -- 'token-standard/splice-api-token-*' 'daml/splice-api-token-burn-mint-v1'`; `TransferEventsV2.daml:109-112`; `BurnMintV1.daml:58-70`.

### 3.1 Daml Finance and the shipped reference applications

A registry that models its bond in Daml Finance already lifecycles it there: a lifecycle rule evaluates the instrument and produces an effect stating, per unit of the target instrument, what is consumed and what is produced, with a settlement time. That effect is internal to the registry's own application. The servicing interfaces are its cross-application projection, and the table maps one onto the other:

| Daml Finance, inside the registry | Servicing, across applications |
| --- | --- |
| the effect's target instrument | `EventKey.instrumentId` |
| a cash quantity produced per unit | `ratePerUnit`, `payInInstrument` |
| the effect's settlement time | `paymentTime` |
| the target instrument consumed, nothing else produced but cash | `EK_Redemption` |
| — | `recordTime`: Daml Finance settles per holding against an instrument version and has no record instant, so the registry has to fix one |
| — | entitlements, redirects, `paidAmount`: no counterpart; the registry derives and records them |

Daml Finance has no release for Daml-LF 2.x, and Digital Asset no longer develops it. Its `main` branch builds with SDK 2.10.0 at `--target=1.17`, the `finance-lifecycling` template shipped with SDK 3.5.2 also targets 1.17, and the upgrade to SDK 3.x has stayed an unmerged draft. Since September 2026 the repository's README states that it is not actively maintained and gives no guarantee of compatibility with newer SDK versions. LF 1.x packages do not run on Canton 3.x, so a registry on the Canton Network cannot run Daml Finance. The table above is therefore a guide for teams that know Daml Finance's model, not a deliverable, and no adapter is planned.

Source: `digital-asset/daml-finance` `daml.yaml` and `README.md` on `main` (README warning added in PR #1305, 2026-09-30); draft PR #1283 (SDK 3.4.8 upgrade); `dpm new --template finance-lifecycling` with SDK 3.5.2.

Digital Asset's `ex-asset-servicing` reference application, now archived and built on SDK 1.18, is the precedent for these workflows (coupons, redemptions, dividends and splits). On one point it takes the opposite approach. There the issuer publishes per-unit lifecycle effects and bumps the instrument's version; each holder, or its bank, then applies the effects to its own position, archiving the old version and creating the new one with the cash beside it. The issuer never learns who holds, and that privacy is the application's stated aim. There is no record instant: entitlement is holding the old version when it is converted, as in Daml Finance after it.

We derive entitlements at the registry for three reasons:

- **Payment authority.** In the reference token, the holding is signed by the admin and the account parties (§13). The holder cannot create the payment from the registry's cash holdings. The coupon must be transferred by the paying agent.
- **Privacy.** The instrument admin already sees every holding. Deriving entitlements at the registry therefore does not reveal it any additional information about positions.
- **Pledged holdings.** If the holder processes its own holding, it receives the coupon unless it forwards the payment to the pledgee. The registry can derive the entitlement using both the position and the redirect, and pay the pledgee directly.

The `Entitlement` template in `ex-asset-servicing` serves a different purpose: it represents a right to receive an asset at a settlement date, rather than a record of who is owed how much at a given record time. Its templates are also confined to that application and are not intended for other applications to read.

### 3.2 Relation to ISO 20022

Custodians and paying agents exchange corporate-action data as ISO 20022 `seev` messages, or their ISO 15022 equivalents. The servicing objects map onto them at message level, so a custodian can translate in both directions without changing its back office:

| Servicing | ISO 20022 (ISO 15022) |
| --- | --- |
| a `LifecycleEvent` announced | `seev.031` Corporate Action Notification (MT564) |
| a corrected event (`supersedes`) | `seev.031` replacing the earlier notification |
| `EK_CashDistribution` | event type `INTR` (Interest Payment) or `DVCA` (Cash Dividend) |
| `EK_Redemption` | event type `REDM` (Final Maturity) or `MCAL` (Full Call/Early Redemption) |
| `recordTime` | record date `RDTE`; ours is an instant, theirs a date, and the registry publishes the date beside it (§4.1) |
| `paymentTime` | payment date `PAYD` |
| an entitlement once derived: units, gross, deductions, net | `seev.035` Movement Preliminary Advice, per account |
| a settlement, `paidAmount` increased | `seev.036` Movement Confirmation (MT566) |
| an event cancelled | `seev.039` Cancellation Advice |
| a correction after payment | no one-to-one counterpart: `seev.037` Movement Reversal Advice reverses a booked movement, which this standard never does. Whether a translator emits a reversal and a new `seev.036`, or a `seev.036` for the difference only, is fixed in the Milestone 1 mapping |
| a redirect | no counterpart; a pledge is handled outside these messages |

`EventKind` stays a two-value enum, because settlement logic depends on it. The ISO event type goes in the event's `meta` under the `cip-<nr>/caev` key, as an optional four-letter code, so a translation to `seev.031` needs no lookup table of its own. The field-level mapping, element by element and for a stated message version, is part of the CIP in Milestone 1.

Source: Clearstream, "ISO 20022 and ISO 15022 equivalent messages"; ECB AMI-SeCo SCoRE corporate-actions standards (event codes); SWIFT MT564 user handbook, field 98a (`RDTE`, `PAYD`).

## 4. The objects

Three objects, five interfaces: `LifecycleEvent`; `Entitlement`; `EntitlementRedirect` with `RedirectInstruction` and `RedirectFactory`.

Factory naming follows the shipped convention (`TransferFactory` / `TransferFactory_Transfer` / `TransferFactoryView`), so the redirect factory is `RedirectFactory` / `RedirectFactory_Propose` / `RedirectFactoryView`.

### 4.0 Identity: business keys, not contract ids

The token standard is built for Daml-LF 2.1, which has no contract keys, and none of its packages uses them. Canton 3.5 adds contract keys from Daml-LF 2.3, but they are not unique: several active contracts may share a key, so a key would not enforce the one-register-per-position rule of §4.3 either. A standard on the token standard's target cannot rely on keys. Every object here also changes state at least once. Changing a field archives the contract and creates a new one, so a stored `ContractId` to one of these objects dangles as soon as the correction flow runs.

```daml
data EventKey = EventKey with
    admin        : Party
    instrumentId : InstrumentId
    eventId      : Text
  deriving (Eq, Ord, Show, Serializable)

data RedirectKey = RedirectKey with
    admin         : Party
    instrumentId  : InstrumentId
    holderAccount : Account
    redirectId    : Text
  deriving (Eq, Ord, Show, Serializable)

data EntitlementKey = EntitlementKey with
    event    : EventKey
    account  : Account               -- ^ the account that held at record time
    redirect : Optional RedirectKey  -- ^ None = the holder's own share; Some r =
                                     --   the slice allocated under redirect r (4.3)
  deriving (Eq, Ord, Show, Serializable)
```

An entitlement is identified by the slice it pays, not by where it pays. Two redirects from one account to the same beneficiary account produce two entitlements with different keys, each naming its redirect; the beneficiary account is a field of the view (`payableTo`), and two slices may share it.

References between objects are keys. A `ContractId` may accompany a key as a resolution hint, never as the reference itself.

**The key is authoritative.** Where a view carries both a key and a field the key already contains, the key wins; implementations MUST populate them consistently and the conformance suite asserts it.

**Registry obligations.** These are not ledger invariants: the suite can observe a registry violating one, but nothing prevents it.

- `eventId` is unique within `(admin, instrumentId)`; `redirectId` within a `RedirectKey`'s other fields.
- `ref` (§4.2) is unique within an event.
- All entitlements of one event carry `terms` equal under the derived `Eq`. No single party can check this, because the event's observers are narrow and a holder sees only its own copy; the suite sees every party and asserts it across them.

### 4.1 Lifecycle event

No event factory: only the admin may announce, so there is no non-admin initiator for a factory to serve.

```daml
data EventKind
  = EK_CashDistribution   -- coupon, dividend, interest
  | EK_Redemption         -- full redemption at maturity or on a call
  deriving (Eq, Ord, Show, Serializable)

data EventStatus
  = ES_Announced
  | ES_Confirmed      -- ^ derivation complete: every entitlement of the event exists
  | ES_Corrected with supersededBy : EventKey
  | ES_Cancelled with replacedBy : Optional EventKey  -- ^ set when the cancellation
                                                      --   replaces the event (7)
  deriving (Eq, Show, Serializable)

data RoundingDirection
  = RD_HalfEven | RD_HalfUp | RD_Down | RD_Floor | RD_Ceiling
  deriving (Eq, Ord, Show, Serializable)

data RoundingRule = RoundingRule with
    decimals  : Int                -- ^ scale of the payment instrument, 0..10 (5.2)
    direction : RoundingDirection
  deriving (Eq, Show, Serializable)

data EventTerms = EventTerms with
    kind            : EventKind
    recordTime      : Time            -- ^ 5.1
    paymentTime     : Time
    ratePerUnit     : Decimal         -- ^ coupon or redemption price per unit
    payInInstrument : InstrumentId
    rounding        : RoundingRule
  deriving (Eq, Show, Serializable)

data LifecycleEventView = LifecycleEventView with
    key            : EventKey
    terms          : EventTerms
    announcedAt    : Time
    synchronizerId : Text            -- ^ the synchronizer recordTime refers to (5.1)
    status         : EventStatus
    supersedes     : Optional EventKey
    meta           : Metadata
  deriving (Eq, Show, Serializable)

data EntitlementPayment = EntitlementPayment with
    entitlementCid : ContractId Entitlement
    amount         : Decimal
    transferLegId  : Text      -- ^ the cash leg in `settlements` that pays it
  deriving (Eq, Show, Serializable)

data SettlementCall = SettlementCall with
    factoryCid : ContractId SettlementFactory
    settleArg  : SettlementFactory_SettleBatch
  deriving (Eq, Show, Serializable)

data SettleBatchResult = SettleBatchResult with
    paidAmounts : [Decimal]   -- ^ the successors' paidAmount, in the order of `payments`
    meta        : Metadata
  deriving (Eq, Show, Serializable)

interface LifecycleEvent where
  viewtype LifecycleEventView
  lifecycleEvent_settleBatchImpl
    : ContractId LifecycleEvent -> LifecycleEvent_SettleBatch -> Update SettleBatchResult
  lifecycleEvent_settleBatchExtraObservers : LifecycleEvent_SettleBatch -> [Party]

  -- | Pays a batch of this event's entitlements and records each payment, in one transaction.
  -- Implementations MUST: require the event live (`ES_Announced` or `ES_Confirmed`);
  -- check every listed entitlement as `Entitlement_Settle` does (`actors == [payingAgent]`,
  -- `status == ETS_Live`, `key.event` equal to this event's key, `0 < amount <= outstanding`,
  -- with equality for `EK_Redemption`), each listed at most once; match each payment to
  -- exactly one cash leg in `settlements`, with receiver `payableTo`, the leg's instrument
  -- (with its factory's admin) equal to `payInInstrument`, the payment's amount, and the
  -- three reference keys in the leg's `meta` (6); exercise every `SettlementCall` and
  -- require every allocation result to be `AllocationResult_Settled`; archive each listed
  -- entitlement and create a successor with `paidAmount` increased by its amount.
  -- Either all of it happens or none of it does (6).
  nonconsuming choice LifecycleEvent_SettleBatch : SettleBatchResult
    with
      actors      : [Party]
      payments    : [EntitlementPayment]
      settlements : [SettlementCall]  -- ^ one per instrument admin: the cash registry's,
                                      --   and the serviced registry's for burn legs (6)
      extraArgs   : ExtraArgs
    observer lifecycleEvent_settleBatchExtraObservers this arg
    controller actors
    do lifecycleEvent_settleBatchImpl this self arg
```

`RoundingDirection` is our own enum because `DA.Numeric.RoundingMode` has no `deriving` clause, so it is not serializable and cannot appear in a view. The standard fixes five of the stdlib's eight modes, mapping onto `RoundingHalfEven`, `RoundingHalfUp`, `RoundingDown` (toward zero), `RoundingFloor` and `RoundingCeiling`. `RoundingUp` and `RoundingHalfDown` are not offered: no settlement convention we found uses them, and each extra mode is another way two implementations can differ. `RoundingUnnecessary` is excluded for a different reason: it is not a rounding convention. It asserts that no rounding is needed and raises a runtime error when that is false.

**Stakeholders.** Signatory: `key.admin`. Observers are implementation-defined and narrow: the admin's own operating parties and any party the registry chooses to disclose to. Normatively, the holder set is not among them.

A contract's stakeholders are visible to its stakeholders, so an event observed by every holder's account parties would tell every holder and every provider who else holds that instrument. That amounts to the complete holder register, a larger disclosure than anything in §9. The rule would also be unsatisfiable at announcement, because the entitled set is only fixed at `recordTime`: a party buying between announcement and record time would not be an observer of the event that entitles it.

An event therefore reaches its audience in two ways, neither through a wide observer set:

- **Before the record time**, as data over the off-ledger announcement endpoint (§8), for display. A wallet showing "XS123 pays on 31 Dec" needs only the terms.
- **After derivation**, as `EventTerms` denormalized onto each holder's own entitlement, which discloses that holder's line and nothing about any other holder.

**Which copy is authoritative.** The copy on the entitlement: it is signed by the admin, it is on the holder's own participant, and the payment is checked against it. Version 1 has no elections, so a holder acts on nothing it reads from the announcement endpoint, and an endpoint that served wrong terms could mislead a display but not a payment. A correction is a new event with its own `EventKey` linked by `supersedes` / `supersededBy` (§7). The event key therefore identifies the version, and an entitlement is bound to a single version of the terms, by its key and by its copy.

A registry whose holder set is already public MAY widen the observers; that is its choice and its disclosure.

The paying agent exercises `LifecycleEvent_SettleBatch` on the event, so the registry either lists it as an observer or discloses the event to it with the choice context. The choice runs with the admin's authority as the event's signatory, which is what lets it re-create the admin-signed entitlements.

**`recordTime` is an instant, not a date.** A record *date* is a calendar convention over a timezone; the ledger has neither. The registry publishes the date in its documentation and the instant on the contract (the date is what ISO 20022 carries as `RDTE`, §3.2), and the suite asserts they correspond. §5.1 defines what the instant means operationally.

**Status.** `ES_Announced` from announcement until derivation; `ES_Confirmed` once every entitlement of the event exists; after that the terms change only by a correction (§7). `ES_Corrected` and `ES_Cancelled` are §7's.

**Clocks.** `announcedAt` and `paymentTime` are ledger times as recorded by the registry, and are informational. `recordTime` alone is normative and is defined against record time at the synchronizer (§5.1).

### 4.2 Entitlement

One per `EntitlementKey`.

```daml
data DeductionKind = DK_Withholding | DK_Fee | DK_Custom with id : Text
  deriving (Eq, Ord, Show, Serializable)

data DeductionBasis
  = DB_Gross       -- ^ the entitlement's grossAmount
  | DB_Remaining   -- ^ gross less the deductions earlier in the list
  | DB_Declared    -- ^ an amount the registry declares; `source` says why
  deriving (Eq, Ord, Show, Serializable)

data Deduction = Deduction with
    kind      : DeductionKind
    basisKind : DeductionBasis
    basis     : Decimal      -- ^ the amount the rate was applied to
    rate      : Decimal
    amount    : Decimal      -- ^ round(basis * rate) per the event's rule
    source    : Text         -- ^ a credential, a standing instruction, a default.
                             --   Declared, not derived. See 9.
  deriving (Eq, Show, Serializable)

data EntitlementStatus
  = ETS_Live
  | ETS_Superseded with supersededBy : EntitlementKey
  | ETS_Cancelled with replacedBy : Optional EntitlementKey
  deriving (Eq, Show, Serializable)

data EntitlementView = EntitlementView with
    key           : EntitlementKey
    ref           : Text         -- ^ opaque, registry-assigned, unique within the event
    payableTo     : Account      -- ^ key.account, or the redirect's beneficiary
    terms         : EventTerms   -- ^ denormalized from the event; 4.1
    payingAgent   : Party
    unitsAtRecord : Decimal      -- ^ units attributed to THIS entitlement; 5.1
    grossAmount   : Decimal      -- ^ round(units * rate); 5.2
    deductions    : [Deduction]
    netAmount     : Decimal      -- ^ = grossAmount - sum(deductions.amount)
    paidAmount    : Decimal      -- ^ sum settled through LifecycleEvent_SettleBatch
                                 --   or Entitlement_Settle, carried across
                                 --   supersession (6, 7)
    derivedFrom   : [ContractId Holding]  -- ^ hint only
    supersedes    : Optional EntitlementKey
    status        : EntitlementStatus
    meta          : Metadata
  deriving (Eq, Show, Serializable)

data EntitlementSettleResult = EntitlementSettleResult with
    paidAmount : Decimal   -- ^ the successor's paidAmount
    meta       : Metadata
  deriving (Eq, Show, Serializable)

interface Entitlement where
  viewtype EntitlementView
  entitlement_settleImpl
    : ContractId Entitlement -> Entitlement_Settle -> Update EntitlementSettleResult
  entitlement_settleExtraObservers : Entitlement_Settle -> [Party]

  -- | Pays `amount` towards this entitlement and records it, in one transaction.
  -- The single-payment path, for a `payableTo` that receives a transfer directly;
  -- `LifecycleEvent_SettleBatch` is the batched path over allocations (6).
  -- Implementations MUST: require `actors == [payingAgent]`, `status == ETS_Live`,
  -- the event live (`ES_Announced` or `ES_Confirmed`, fetched from the context,
  -- with its key equal to `key.event`)
  -- and `0 < amount <= netAmount - paidAmount`, with equality for `EK_Redemption`
  -- (no partial redemption payment); move `amount` of `payInInstrument`
  -- to `payableTo` inside this choice, by a movement that completes in this
  -- transaction; archive this contract and create a successor with `paidAmount`
  -- increased by `amount`. Either both happen or neither does (6).
  nonconsuming choice Entitlement_Settle : EntitlementSettleResult
    with
      actors    : [Party]
      amount    : Decimal
      extraArgs : ExtraArgs   -- ^ the servicing registry's context, with the cash
                              --   registry's transfer-factory context nested (6)
    observer entitlement_settleExtraObservers this arg
    controller actors
    do entitlement_settleImpl this self arg
```

**What is owed, at any moment,** is `outstanding = netAmount - paidAmount`, which is computed and never stored. Positive, the entitlement is open for that much; zero, settled; negative, overpaid, and the difference is a claim of the registry on `payableTo` (§7). Storing a settlement state beside the two amounts would be a third field that could disagree with them.

**Stakeholders, normative.** Signatory: `key.event.admin`. Observers: `accountParties admin key.account` ∪ `accountParties admin payableTo` ∪ `[payingAgent]`. The paying agent is included because it settles the entitlement and otherwise could not read it.

**Storage cost.** One persistent contract per entitlement on every stakeholder's participant, re-created once per payment and once per correction. An instrument with 50,000 holders paying quarterly derives 200,000 entitlements a year and creates at least 400,000 contracts for them (the derivation and at least one payment each), each replicated to the holder's and any provider's participant. Settled entitlements stay active as the record of what was paid, so the live set grows by about 200,000 a year until a registry archives closed events under its own retention policy.

Eager register creation (§4.3) adds one more per `(account, instrument)`: 50,000 on that instrument, observed by the holder's account parties, whether or not a redirect is ever proposed. That is a quarter as many contracts as the 200,000 entitlements a year, but it is a one-off cost, while the entitlements recur with every event. It is the price of serializing the first completed redirect on a position as well as later ones. §12.3 puts the entitlement alternative to the SIG; the register has no alternative to put.

**Traffic cost.** Each of these contracts is created by a transaction, and on the Global Synchronizer the submitting participant pays traffic for it. A confirmation request costs its size in bytes, with a small surcharge per recipient participant (`readVsWriteScalingFactor` is in parts per 10,000, so 0.04% each at the Global Synchronizer's value of 4), times `extraTrafficPrice`; since CIP-0104, confirmation responses are free. Both are governance parameters. At the time of writing MainNet sets `extraTrafficPrice` to 60 USD per MB, which is 0.06 USD per kilobyte. The registry pays for derivation, corrections and register creation, the paying agent for settlement, and each approving party for its own redirect command.

What drives the size of a confirmation request is mainly the number of *views*: a new view starts wherever a sub-action has informees its parent does not (CIP-0112 §4.3.8). The servicing transactions are therefore designed by views, per batch of *n* entitlements:

| Transaction | Transactions | Views | Why |
| --- | --- | --- | --- |
| Derivation | 1 per batch | 1 + n | each entitlement has its own stakeholders (the holder's account parties, and the beneficiary's for a slice), so each create is a view; unavoidable while entitlements are per account |
| Payment, cash instrument with privacy between holders | 1 per batch | about 3n + 2 | per account, one view creating its receipt allocation and one updating its entitlement; per allocation, one sub-view of `SettlementFactory_SettleBatch` (CIP-0112 §4.3.8.1, rule 4); plus the root and the paying agent's cash allocation |
| Payment in Canton Coin | 1 per batch | about 2n + 3 | as above, but Amulet settles the batch in one view (CIP-0112 §4.3.8.3) |
| Correction | 1 per batch | 1 + n | as derivation, for the entitlements it touches |
| Redirect, each command | 1 | a few | not per holder; does not grow with the instrument |

The single-payment path, one `Entitlement_Settle` per entitlement, costs n transactions instead of one. To stay at these figures an implementation SHOULD set `lifecycleEvent_settleBatchExtraObservers` and the registry's own `…ExtraObservers` so that the informees inside a choice only decrease, and SHOULD archive and re-create an entitlement inside one consuming exercise so the two share a view. CIP-0112 §4.3.8.4's `extraReceiptAuthorizers`, which would let a settlement create missing receipt allocations itself, is not in the shipped `SettlementFactory_SettleBatch` (removed per `V2_VALIDATION.md`); creating the receipt allocations in the same command as the batch (§6) gives the same transaction count. A batched entitlement per provider (§12.6) would cut derivation to 1 plus the number of providers, at the price of showing a provider's clients to each other's observers.

These are design targets, not measurements. Milestone 3 measures the views and bytes of each transaction type on the reference registry and publishes them with the suite. Under CIP-0104 as amended (approved 2026-10-27), a transaction submitted by a featured application counts its whole traffic as that application's activity, and a transaction submitted by a user splits it among the featured applications that confirm it; a registry or paying agent holding a `FeaturedAppRight` therefore earns app rewards on the servicing transactions it submits. CIP-0129 (approved 2026-10-23) sets the framework for charging traffic on other production synchronizers at the Global Synchronizer's list price, with the details left to a later CIP, so the same view counts apply to a registry on its own synchronizer.

This rule is ours. `EventLog_HoldingsChange`'s "observers MUST include at least the account parties" constrains the observers of a nonconsuming choice, which is a transient disclosure on a transaction, and says nothing about the stakeholders of a persistent contract.

Source: `TransferEventsV2.daml:92-95`.

**Changed only by payment, and no `_PublicFetch`.** An entitlement is a statement of what is owed and what has been paid. A settlement, `Entitlement_Settle` on the entitlement or `LifecycleEvent_SettleBatch` on its event, is the only way the second figure changes; supersession and cancellation are the registry's own operations on its own contract (§7). Its readers are its observers, who read it off their own participant; a party that is not an observer has no disclosure source for it.

**`derivedFrom` is a hint.** By payment time those holdings are archived and cannot be fetched. Reproducing the figure needs the ACS at the record offset or the update history. `derivedFrom` lets a party that has the history see which contracts the registry used; it does not let a party without the history verify anything. §5.5 states what verification requires.

### 4.3 Entitlement redirect

```daml
data RedirectStatus
  = RS_Live
  | RS_Revoked with revokedAt : Time
  | RS_Expired
  deriving (Eq, Show, Serializable)

data RedirectScope = RedirectScope with
    instrumentId : InstrumentId
    unitsCap     : Optional Decimal  -- ^ None = the whole position; then no other
                                     --   redirect may be live, and toTime MUST be set
    kinds        : [EventKind]       -- ^ [] = all kinds
    fromTime     : Time              -- ^ compared against the event's recordTime
    toTime       : Optional Time     -- ^ likewise
  deriving (Eq, Show, Serializable)

data EntitlementRedirectView = EntitlementRedirectView with
    key          : RedirectKey
    beneficiary  : Account
    scope        : RedirectScope
    priority     : Int               -- ^ handed out by the register at completion
    status       : RedirectStatus
    revokeRequestedBy : [Party]      -- ^ parties other than the beneficiary's owner
                                     --   that asked to revoke
    agreementRef : Optional AnyContractId  -- ^ id only; see 9
    meta         : Metadata
  deriving (Eq, Show, Serializable)

interface EntitlementRedirect where
  viewtype EntitlementRedirectView
  entitlementRedirect_revokeImpl
    : ContractId EntitlementRedirect -> EntitlementRedirect_Revoke -> Update RedirectResult
  entitlementRedirect_revokeExtraObservers : EntitlementRedirect_Revoke -> [Party]
  entitlementRedirect_expireImpl
    : ContractId EntitlementRedirect -> EntitlementRedirect_Expire -> Update RedirectResult
  entitlementRedirect_expireExtraObservers : EntitlementRedirect_Expire -> [Party]

  -- | One party per call, from either side. Any other call records a request;
  -- a call by the beneficiary account's owner completes the revocation (4.3).
  nonconsuming choice EntitlementRedirect_Revoke : RedirectResult
    with
      actors    : [Party]
      extraArgs : ExtraArgs
    observer entitlementRedirect_revokeExtraObservers this arg
    controller actors
    do entitlementRedirect_revokeImpl this self arg

  nonconsuming choice EntitlementRedirect_Expire : RedirectResult
    with
      actors    : [Party]
      extraArgs : ExtraArgs
    observer entitlementRedirect_expireExtraObservers this arg
    controller actors
    do entitlementRedirect_expireImpl this self arg

-- | What a pending instruction proposes; the redirect's priority and status
-- exist only once it completes.
data RedirectProposal = RedirectProposal with
    key          : RedirectKey
    beneficiary  : Account
    scope        : RedirectScope
    agreementRef : Optional AnyContractId
    meta         : Metadata
  deriving (Eq, Show, Serializable)

data RedirectInstructionView = RedirectInstructionView with
    admin            : Party
    proposal         : RedirectProposal
    approvedBy       : [Party]       -- ^ approvals collected so far, proposer included
    availableActions : Map.Map RedirectAction [[Party]]
                                     -- ^ every group under RA_Approve is one party
    expiresAt        : Optional Time
    meta             : Metadata
  deriving (Eq, Show, Serializable)

interface RedirectInstruction where
  viewtype RedirectInstructionView
  redirectInstruction_approveImpl
    : ContractId RedirectInstruction -> RedirectInstruction_Approve -> Update RedirectResult
  redirectInstruction_approveExtraObservers : RedirectInstruction_Approve -> [Party]

  -- | Records the approval of `actors`, which MUST be one of the single-party
  -- groups listed under `RA_Approve`. Returns Pending with the successor instruction while approvals
  -- are missing; the approval that completes the set creates the redirect.
  nonconsuming choice RedirectInstruction_Approve : RedirectResult
    with
      actors    : [Party]
      extraArgs : ExtraArgs
    observer redirectInstruction_approveExtraObservers this arg
    controller actors
    do redirectInstruction_approveImpl this self arg

  -- _Reject and _Withdraw are identical in shape — their methods, observer
  -- methods and choices are elided here — callable by any beneficiary-side and
  -- any holder-side account party respectively.

data RedirectAction = RA_Approve | RA_Reject | RA_Withdraw
  deriving (Eq, Ord, Show, Serializable)

data RedirectResult_Output
  = RedirectResult_Pending with instructionCid : ContractId RedirectInstruction
  | RedirectResult_Completed with redirect : RedirectKey
  | RedirectResult_Failed
  deriving (Eq, Show, Serializable)

data RedirectResult = RedirectResult with
    output : RedirectResult_Output
    meta   : Metadata
  deriving (Eq, Show, Serializable)

interface RedirectFactory where
  viewtype RedirectFactoryView
  redirectFactory_proposeImpl
    : ContractId RedirectFactory -> RedirectFactory_Propose -> Update RedirectResult
  redirectFactory_publicFetchImpl
    : ContractId RedirectFactory -> RedirectFactory_PublicFetch -> Update RedirectFactoryView
  redirectFactory_proposeExtraObservers : RedirectFactory_Propose -> [Party]

  nonconsuming choice RedirectFactory_Propose : RedirectResult
    with
      holderAccount : Account
      beneficiary   : Account
      scope         : RedirectScope
      agreementRef  : Optional AnyContractId
      actors        : [Party]
      extraArgs     : ExtraArgs
    observer redirectFactory_proposeExtraObservers this arg
    controller actors
    do redirectFactory_proposeImpl this self arg

  nonconsuming choice RedirectFactory_PublicFetch : RedirectFactoryView
    with actors : [Party]
    controller actors
    do redirectFactory_publicFetchImpl this self arg

data RedirectFactoryView = RedirectFactoryView with
    admin : Party
    meta  : Metadata
  deriving (Eq, Show, Serializable)
```

Every state-changing choice here is nonconsuming and returns a result, as are all fifteen state-changing choices in the shipped V2 interfaces; the fourteen outside `EventLog` also carry an `…ExtraObservers` method. `_Revoke` and `_Expire` MUST archive the redirect and create a successor carrying `RS_Revoked` or `RS_Expired` (or, for a recorded revocation request, the same status with `revokeRequestedBy` extended). A consumed contract has no view, so a revocation that only archived would be indistinguishable from absence. `_Expire`'s `actors` MUST be the admin, and the implementation MUST reject unless `scope.toTime` is set and has passed; without that check the admin could archive any live redirect at will. A redirect with `toTime = None` is never expirable.

**What a redirect is.** An instruction, approved by the holder's side and the beneficiary's side, that income derived from the units held in `holderAccount` at an event's record time is paid to `beneficiary`, up to `unitsCap`. Its only source is the account's position: if the account holds nothing at the record time, the redirect yields nothing. A pledge does not by itself decide who receives income. The pledge agreement says what the parties agreed and the lock says the units cannot move; only a completed redirect tells the registry to pay someone other than the holder. An obligation to pay a counterparty an amount regardless of what the account holds (the equivalent payment a securities borrower owes a lender after selling the borrowed bond) is not a redirect, and version 1 does not model it (§13).

**Authorization: one party per command.** The holder's account parties, the beneficiary's account parties and the registry are, in the case this standard exists for, on different participants, and a command can only act as parties its participant hosts. No choice here therefore needs two account parties in one command. The flow follows the shipped transfer instruction, where `TransferFactory_Transfer` "SHOULD … allow all the sender's account parties to call this choice, so they can all initiate a transfer on their own", and further approvals arrive as steps on a pending instruction:

- **Propose.** Any one holder-side account party exercises `RedirectFactory_Propose` alone. The holder side is `accountParties admin holderAccount`: the principal and, where one is set and differs, the provider. The registry's authority comes from its own factory, so the registry is never a separate step. The result is a pending `RedirectInstruction` whose `approvedBy` holds the proposer.
- **Approve.** Every further approval is one `RedirectInstruction_Approve` by one party, from its own participant. `availableActions` lists, under `RA_Approve`, each party whose approval is still missing, one party per group. Which further account parties must approve is the registry's account policy, as it is for transfers; the standard fixes the minimum: the principal of the holder account and the principal of the beneficiary account both approve. A provider therefore cannot redirect its client's income on its own authority, even to an account it owns itself as in the Milestone 1 fallback (§9), where the provider is the whole beneficiary side but the holder still approves. Each approval archives the instruction and creates a successor with `approvedBy` extended, until the approval that completes the set creates the redirect.
- **Reject and withdraw.** Any beneficiary-side party may reject and any holder-side party may withdraw, alone, archiving the instruction.
- **Revoke.** `EntitlementRedirect_Revoke` is likewise called by one party. A call by the owner of the beneficiary account (the party the redirect benefits, releasing its own claim) completes the revocation, whether or not a request was recorded. A call by any other account party, on the holder's side or the beneficiary's provider, records a request in `revokeRequestedBy` and changes nothing else. Creation needs both owners, and so does every way of ending a redirect early: the holder's side cannot take the income back alone, and a pledgee's custodian cannot give up its client's claim. Under the fallback design of §9 the beneficiary account is owned by the provider, which is then the owner that completes.

CIP-0112 mandates provider visibility on asset movements and holdings, and a redirect is neither; whether a provider's approval is required is therefore left to the registry's policy. On a basic account there is no provider and the principal alone represents the holder's side.

**Stakeholders.** `EntitlementRedirect`: signatory `key.admin`, the same party that signs the register, which makes the exclusivity check enforceable in one transaction; observers `accountParties admin key.holderAccount` ∪ `accountParties admin beneficiary`. `RedirectInstruction`: signatory `admin`; observers the same two sets, so every party that may approve can see what it approves from its own participant. §9's rows for the registry, the two providers and the beneficiary are claims about these sets. The holder's provider is therefore an observer of every redirect on its client's position, which is why it is the counterparty that can recompute the whole split (§5.5).

**Scope is by account and instrument with an optional cap, never by holding id.** Holdings are archived and re-created on every transfer, split, merge, lock and unlock, so a redirect pinned to a `ContractId Holding` stops matching the moment the position is touched, including by the lock the pledge itself creates.

**Which events a redirect catches** is decided by the snapshot as well as the scope (§5.1). The redirect must be live in the ACS at the record offset, and its scope must then match: the event's kind is in `kinds` (or `kinds` is empty), `fromTime <= recordTime`, and `toTime` is `None` or `recordTime <= toTime`. So `fromTime` can narrow a redirect but never extend it backwards: a redirect completed after a record time does not catch that event, whatever `fromTime` it carries.

**Allocation under competing redirects.** Priority is the `Int` the register hands out when a redirect completes, which is monotone and therefore a total order with no tie-break needed. It is fixed then and never re-evaluated, so a redirect completed later can never take units from one already live. `fromTime` plays no part: it is a scope filter, holder-supplied, so ranking on it would let a proposer jump the queue.

Derivation allocates in priority order among the redirects that catch the event: each takes up to its cap until the position is exhausted, and the holder keeps the remainder. If the position is below the committed caps, the holder's own share absorbs the shortfall first, down to zero, and only then does the lowest-priority redirect receive less than its cap. Each entitlement names the redirect it was allocated under in its key.

**Uncapped redirects.** A redirect with `unitsCap = None` claims the whole position. It may complete only if nothing else is live on that position, it blocks every later completion while it lives, and it MUST carry a `toTime`; without one, a beneficiary that never revokes would encumber the position permanently.

**Capped redirects** may coexist without limit, and their caps are not checked against the position, for the reason below. One with no `toTime` is never expirable, so its slice can be encumbered the same way; the exposure is the cap in units. We accept that and do not force a deadline on every redirect, because a pledge of a fixed number of units with no stated end is an ordinary arrangement.

**Exclusivity is enforced per position, not per scope.** An uncapped redirect over coupons only still blocks a capped one over redemptions only, and one whose window has not started still blocks one whose window has ended. The reason is that the check must be answerable from the register, which carries aggregates and no scopes, and a register that carried scopes would disclose them to every approving beneficiary (§9). Parties that want disjoint uncapped redirects on one position cap them instead.

**Serializing redirect completion.** Daml cannot check non-existence, so "no conflicting redirect exists" is unenforceable against concurrent commands. Completion must therefore be serialized per position, through a contract the registry consumes and re-creates. Only the completing approval touches it; earlier approvals change the instruction alone.

**That contract is not in this package.** An interface package should not declare a template: damlc rejects it by default (the error can be downgraded to a warning with `-Wupgrade-interfaces`) with "This package defines both interfaces and templates. This may make this package and its dependents not upgradeable", and none of the thirteen shipped `splice-api-token-*` packages contains a `template`. The standard therefore specifies the obligation and the aggregate the completing approval's choice context must supply, and the register itself is a registry-side template. The reference registry's version:

```daml
template RedirectRegister with
    admin          : Party
    holderAccount  : Account
    instrumentId   : InstrumentId
    committedUnits : Decimal   -- ^ sum of live caps
    liveCount      : Int
    uncappedLive   : Bool      -- ^ an aggregate cannot otherwise distinguish a
                               --   live uncapped redirect from a live zero-cap one
    nextPriority   : Int       -- ^ handed out and incremented at completion
  where signatory admin
        observer accountParties admin holderAccount
```

Normative for any registry, whatever it calls its own register:

- Exactly one live register per `(holderAccount, instrumentId)`, signed by the admin and observed by the holder's account parties, so a holder can always see its own committed total.
- **First created only by commands the registry itself submits**, never inside another party's transaction, such as the receiving leg of a transfer, a settlement or a mint, whose commands carry someone else's submitter and command id. The registry creates it eagerly: at the account's setup, for an instrument with explicit accounts; by its own automation on observing the first holding in the account, for one with implicit accounts (CIP-0112 §4.3.2.2: "Some assets like Canton Coin will use implicit accounts only"); and in any case before it serves a choice context for the account, including a `_Propose` context, which covers arranging a pledge before the position arrives.
- **Creation must not race**, and the ledger does not prevent it: two creates of the same register are two valid commands. Because every creation is the registry's own command, the registry can serialize them: it submits them all as one user from one participant, with a command id derived deterministically from `(admin, holderAccount, instrumentId)`, so the Ledger API's command deduplication (scoped to the participant, the submitting user, the acting parties and the command id, all fixed here) rejects the second of two concurrent creations; and before submitting, the registry checks its own active contract set for a live register. Deduplication alone is bounded by its period and the check alone races; together they leave a window only if a register is created, archived without a successor, and created again, and no operation here does that.
- A redirect cannot complete without a register: the completing approval consumes it, so a position with none has no completed redirects.
- Consumed and re-created by the completing `_Approve`, a completing `_Revoke` and `_Expire`; never by `_Propose`, by a non-completing approval, or by a revocation request.
- The register is disclosed to an approving beneficiary-side party, and a disclosed contract carries its full create argument (`DisclosedContract.createdEventBlob` is "the serialized created event"). The beneficiary therefore learns the whole payload, `nextPriority` included, and no arrangement of fields changes that: an admin-only side contract would have to be disclosed too for the beneficiary's participant to exercise over it, and the beneficiary is a witness of its archive regardless. §9 states the disclosure.

How each choice moves the aggregates, so that any two registries agree on them:

| Choice | `committedUnits` | `liveCount` | `uncappedLive` | `nextPriority` |
| --- | --- | --- | --- | --- |
| completing `_Approve`, capped at *c* | + *c* | + 1 | unchanged | handed to the redirect, then + 1 |
| completing `_Approve`, uncapped | unchanged | + 1 | `True` | handed to the redirect, then + 1 |
| completing `_Revoke` / `_Expire`, capped at *c* | − *c* | − 1 | unchanged | unchanged |
| completing `_Revoke` / `_Expire`, uncapped | unchanged | − 1 | `False` | unchanged |

Two proposals on one position both succeed, and so do any number of non-completing approvals; two *completions* race, and one loses.

Expiry needs `_Expire` because `toTime` passing runs no transaction: nothing would decrement `committedUnits`, and the capacity would stay committed. Until the registry sweeps, an expired redirect still occupies its place in the register, but not in any entitlement, because the scope rule above already excludes events after `toTime`.

The two outcomes are different and the suite tests both:

- **Contention.** The losing completion fails because a contract it used is no longer active. This is reported as contract-not-active when the command is interpreted, or as an inactive or locked contract when it is confirmed; the suite keys on that category, not on one error code. The losing party re-fetches the choice context and retries. The retry succeeds unless the business rule now rejects it.
- **Business rejection.** An uncapped redirect is live, or this redirect is itself uncapped and something else is live. Retrying will not help, and a wallet shows why. A retry can also end this way: when either of two racing redirects is uncapped, the loser's retry is rejected.

The completing approval is a choice on `RedirectInstruction`, so the register reaches that party as a disclosed contract in that instruction's choice context (§8, `…/redirect-instructions/{id}/choice-contexts/approve`).

**Caps are not checked against the current position.** Checking them on-ledger would require disclosing the holder's position to the approving beneficiary. An off-ledger check could not be verified by the Daml conformance suite.

The allocation rule already defines what happens when committed caps exceed the position: the holder's share absorbs the shortfall first, followed by the lowest-priority redirect. The same situation can arise if the position decreases after a redirect completes, so a check at completion would not prevent it. `committedUnits` is therefore informational, not a limit.

`committedUnits` tells a beneficiary how much is committed ahead of it, since every redirect live at its completion has a lower priority number. It does not tell it whether the position covers that amount plus its own cap, because the beneficiary never sees the position. Coverage is the pledge agreement's business, checked by whatever means that agreement provides; the register does not establish it.

What the choice body does check on-ledger, and the suite therefore tests, is the uncapped-exclusivity rule: an uncapped redirect may complete only when `liveCount = 0`, and none may complete while `uncappedLive`. Both conditions are answerable from the register alone. Concurrency can break this invariant, and the serialization exists to protect it.

The register carries aggregates only, never the list of redirects, their beneficiaries or their scopes, and contention on it is bounded to one holder's position in one instrument.

## 5. Derivation

### 5.1 The snapshot

**What is read.** The registry establishes two sets from the ACS at the ledger offset corresponding to `recordTime` (or by folding the update stream to that offset): the holdings of the instrument, and the redirects on those positions with their status. It does not use an on-ledger `fetch`, which only sees currently active contracts. Both sets come from the same offset, so holdings and redirects are never read at different moments.

**The boundary.** Activeness is decided by record time at the synchronizer, not by the ledger time a submission requested. A contract is in the snapshot iff it was created by a transaction whose record time is at or before `recordTime`, and not archived by one whose record time is at or before `recordTime`. So a holding created at exactly `recordTime` counts, and one archived at exactly `recordTime` does not; one archived after it does, because it was live at the instant.

**What follows for redirects.** A redirect counts iff the contract active at the record offset carries `RS_Live` and its scope matches the event (§4.3). Consequences, each asserted by the suite:

- a redirect completed after `recordTime` does not catch the event, whatever its `fromTime`;
- a redirect revoked or expired after `recordTime` still catches it, because the revocation is the successor contract, which did not exist at the offset;
- a redirect revoked before `recordTime` does not.

**Locked holdings count.** A pledged bond is still held.

**Completeness.** A participant has a complete view through `recordTime` once it has ingested an update or an `OffsetCheckpoint` whose time on the event's synchronizer is later than `recordTime`; until then a late transaction could still change the set. The Ledger API emits offset checkpoints with each synchronizer's current time even when no transaction concerns the participant, so a participant with no traffic on the synchronizer still reaches this point. The registry MUST NOT derive before that. A counterparty verifying the figures applies the same rule on its own participant.

**Offsets are local.** An offset is an index into one participant's update stream, and two participants number the same transaction differently. "The offset corresponding to `recordTime`" is therefore each participant's own: the last offset on that participant whose record time is at or before `recordTime`. The standard compares contracts and figures across participants, never offsets.

**One synchronizer.** `LifecycleEventView.synchronizerId` names the synchronizer `recordTime` refers to. If the registry observes a position's holdings of the instrument on any other synchronizer at that offset (or a holding unassigned from one synchronizer and not yet assigned to another), it MUST NOT derive entitlements for that position until the position is resolved. The other positions are derived as usual: each entitlement depends only on its own position (§5.4), so one holder's reassignment does not hold up the rest of the event. Declaring a synchronizer does not make holders elsewhere unentitled, it only hides them. A reassignment between `recordTime` and `paymentTime` does not affect the snapshot, which is already fixed.

**Retention.** Independent verification needs the history at the record offset. The registry, and any provider that verifies, MUST retain its update history from `recordTime` until every entitlement of the event is settled, superseded or cancelled and no correction of it is pending; pruning earlier makes the figures unverifiable. A participant that migrates or is restored from backup MUST resume from a state that still contains that history. The suite cannot test pruning; the integration guide states it as an operating requirement.

**Units per entitlement.** `unitsAtRecord` on an entitlement is the units attributed to that entitlement, not the account's whole position. Under a partial redirect one account yields two or more entitlements (the holder's share and one per redirect slice), and their `unitsAtRecord` sum to the position at `recordTime`. A capped slice tells its beneficiary the slice and not the position, with two exceptions that §9 names: an uncapped redirect's entitlement *is* the whole position, and a beneficiary whose slice falls short of its cap can work the position out. §8 keeps the holder's holdings out of the approval choice context, so neither exception arises from the redirect flow itself.

### 5.2 The arithmetic, pinned

`Decimal` is `Numeric 10`, and `*` on two `Numeric 10` values yields a `Numeric 10`, rounding the exact product half-even at scale 10. A naive `unitsAtRecord * ratePerUnit` is therefore already rounded before any explicit rounding, and two implementations placing that intermediate differently disagree.

`DA.Numeric.mul` takes two scales and produces a third, so the exact product of two `Decimal`s is available at scale 20 with no rounding at all. Normatively, the product is computed there and rounded once:

```daml
toMode : RoundingDirection -> DN.RoundingMode
toMode = \case
  RD_HalfEven -> DN.RoundingHalfEven
  RD_HalfUp   -> DN.RoundingHalfUp
  RD_Down     -> DN.RoundingDown
  RD_Floor    -> DN.RoundingFloor
  RD_Ceiling  -> DN.RoundingCeiling

grossAmountOf : RoundingRule -> Decimal -> Decimal -> Decimal
grossAmountOf rule units rate
  | rule.decimals < 0 || rule.decimals > 10 =
      error ("rounding.decimals outside 0..10: " <> show rule.decimals)
  | otherwise =
      DN.cast (DN.roundNumeric rule.decimals (toMode rule.direction) (DN.mul units rate : Numeric 20))
```

The expression rounds once, at the stated scale, in any of the five directions the standard fixes, and it compiles at `--target=2.1`.

Two limits, both normative:

- `rounding.decimals` is in `0..10`; outside that range the implementation rejects the event and the suite asserts the rejection.
- `Numeric 20` represents values strictly between −10^18 and 10^18, so a product at or beyond 10^18 overflows and the implementation MUST reject rather than round. The suite asserts the rejection at that boundary.

**Not `BigNumeric`.** `DA.BigNumeric` exports nothing below LF 2.dev (its module body is behind `#ifndef DAML_BIGNUMERIC`), and every token-standard package is `--target=2.1`. A package built the way the standard is built cannot use it, and a registry shipping a 2.dev DAR would need alpha-version support on every participant and synchronizer that vets it. Verified by compiling at 2.1, 2.2, 2.3 and 2.dev.


Source: `DA/Numeric.daml:28-31` (`mul`), `:216-226` (`roundNumeric`), `:41-42` (`cast`); `DA/BigNumeric.daml:4-11`; `DA/Internal/Prelude.daml:573-591`; token-standard `daml.yaml` files (`--target=2.1`, `sdk-version: 3.5.2`).

### 5.3 Deductions and net

Deductions apply in list order. Each states its basis structurally as `DB_Gross` (the entitlement's `grossAmount`), `DB_Remaining` (gross less the deductions before it in the list) or `DB_Declared` (an amount the registry supplies, with `source` saying why). It records the resulting `basis` value, the `rate`, and `amount = round(basis * rate)` at the event's scale and direction, by the §5.2 expression. A withholding on gross and a fee on the remainder are both expressible, and for the first two kinds a counterparty can recompute `basis` as well as `amount`.

```
netAmount = grossAmount - sum(deductions.amount)
```

**Withholding is an input.** A `Deduction` records where the rate came from: a credential, a standing instruction, a default. It does not compute tax, which is jurisdictional and is the registry's responsibility and liability.

### 5.4 The rounding residual

Each entitlement is rounded on its own, so the sum of entitlements differs from the exact `rate × total units` by a residual of at most one minor unit per entitlement. The residual stays with the registry. It is not allocated to holders, and no entitlement carries a share of it.

The rule keeps every `grossAmount` a pure function of that entitlement's own `unitsAtRecord` and the event terms. An account provider can recompute each client's entitlement using its own holdings and the event terms, without access to other holders' positions. The conformance suite tests that the independently derived figures match. Any rule that allocates the residual ranks holders against each other and destroys that property; it belongs in an extension, with the funded-total field it needs (§13).

Consider a holder who splits a position. At `decimals = 0` and a rate of 0.4 per unit, one account holding 2 units receives `round(0.8)`, while two redirect slices of 1 unit each receive `round(0.4)` each:

| Direction | One slice of 2 | Two slices of 1 | Effect of splitting |
| --- | --- | --- | --- |
| `RD_HalfUp`, `RD_HalfEven` | 1 | 0 + 0 | −1 |
| `RD_Ceiling` | 1 | 1 + 1 | +1 |
| `RD_Floor`, `RD_Down` | 0 | 0 + 0 | 0 |

So splitting can gain or lose, by at most one minor unit per extra slice, paid by or to the registry and never by or to other holders. A registry choosing `RD_Ceiling` accepts that it pays the gain.

### 5.5 What independent verification is

The counterparty can read the registry's entitlement contract, but this alone does not establish that the figures are correct. Each party must derive the fields it can verify from its own participant. The conformance tooling compares those results as follows:

| Field | Derived from | Holder's provider | Beneficiary |
| --- | --- | --- | --- |
| `unitsAtRecord` | holdings at its own record offset, and the redirects live there | yes: it observes the holdings and every redirect on the position | no: it sees neither the position nor the other redirects |
| `payableTo` | the same | yes | its own slice only |
| `grossAmount` | `unitsAtRecord` + `terms` | yes | yes, given the entitlement's `unitsAtRecord` |
| `deductions` | basis kinds and declared rates | `DB_Gross` and `DB_Remaining`: yes, where it holds the same rate inputs. `DB_Declared`: no, the registry supplies the basis | arithmetic only, given the declared rates |
| `netAmount` | the above | yes | arithmetic only |
| `paidAmount` | the movements the settlements performed | on the holder's own share, yes, against the receipts into its client's account. On a redirected slice, no: it sees only the registry's successor contract, not the payment into the beneficiary's account | yes, for its own slice, against the receipts into its own account |

The holder's provider compares its independently derived figures with the registry's figures for both entitlements on the holder's account. This covers the units, allocation, gross amount, deductions on a gross or remaining basis, net amount, payable account and payments made to the holder. The registry supplies declared deduction bases, which the provider cannot independently derive. The beneficiary separately checks the redirected entitlement's arithmetic and compares `paidAmount` with its own receipts; it cannot independently verify the allocation.

### 5.6 Test vectors

Milestone 2 will deliver test vectors covering rounding boundaries in each of the five directions, at scales 0 and 10; the overflow boundary at 10^18; multiple deductions on each of the three basis kinds; zero-entitlement holders; holdings and redirects created and archived on each side of `recordTime`, including at the record time itself; a position split across two accounts with the same provider; a partial redirect; two redirects from one account to the same beneficiary account; a position below the committed caps; and the §5.4 splitting examples.

## 6. Payments and settlement

A settlement moves the payment and updates `paidAmount` in the same transaction, so the movement and the record commit together or neither does. There are two paths:

- **Batched, over allocations: `LifecycleEvent_SettleBatch`.** The default. The paying agent lists entitlements of one event, each with an amount and the cash leg that pays it, and the `SettlementFactory_SettleBatch` calls that carry those legs. The choice checks every leg against its entitlement, runs the calls, and re-creates each entitlement with `paidAmount` increased.
- **Single, by transfer: `Entitlement_Settle`.** For a `payableTo` that receives a transfer directly, such as a basic Canton Coin account holding a `TransferPreapproval`. The choice transfers with `TransferFactory_Transfer` and re-creates the entitlement.

| Case | Movement inside the settlement | Reference carried in the `meta` of each leg side of both allocations, or in `Transfer.meta` on the single path |
| --- | --- | --- |
| Cash distribution | a cash leg, paying agent → `payableTo`, settled by `SettlementFactory_SettleBatch`; or `TransferFactory_Transfer` on the single path | `cip-<nr>/instrument` = the serviced instrument, `cip-<nr>/event` = `eventId`, `cip-<nr>/entitlement` = the entitlement's `ref` |
| Redemption | The cash transfer is handled as for a distribution, for the full outstanding amount. The units are retired to the `cip-112/burn` account through CIP-0112's delivery-versus-burn flow, using the mechanism in `TestDeliveryVersusBurnMint`. The burn leg runs in the same choice when the holder's allocation is available (see below). | Same references on both legs |

The settlement flow handles retries, concurrent calls and corrections as follows:

- **Retry after a committed payment.** If a worker crashes after the transaction commits and retries, the original entitlement has already been archived. The retry fails because the contract is no longer active, and the successor's `paidAmount` already includes the payment. If the worker crashes before the transaction commits, neither the payment nor the entitlement update takes effect, so the operation can be retried.

- **Concurrent settlements.** If two workers try to settle the same entitlement, alone or in batches, both attempt to archive the same contract. One succeeds; the other fails and must read the updated state before retrying.

- **Partial payments.** A distribution can be paid in several settlements, each bounded by `netAmount - paidAmount`. The successor records the cumulative amount paid. A redemption entitlement must be settled for its full outstanding amount: partial redemption is outside version 1.

- **Corrections racing with payments.** A correction also archives the current entitlement (§7). If the payment commits first, the correction carries the updated `paidAmount` into the replacement entitlement. If the correction commits first, the payment against the archived entitlement fails.

**Receipt allocations.** V2 settles a leg only against an allocation on each side, and since the changes in `V2_VALIDATION.md` `SettlementFactory_SettleBatch` needs only the executors' authority. The receiver side comes from a receipt-only authorization: each payable account, through one of its account parties, signs once a delegation that lets the paying agent create receipt allocations for that account and nothing else. The shape is `TradeSettlementAgreement_CreateReceiptAllocation` in `TradingAppV2`, and the check is `Splice.TokenStandard.Utils.ensureIsReceiptAllocation`: the paying agent as executor, the account as authorizer, receiver-side legs only, no input holdings, no next-iteration funding, not committed. For each batch the paying agent creates one receipt allocation per payable account, and one allocation of its own cash with a sender leg per payment, in the same command as `LifecycleEvent_SettleBatch`, so allocation and settlement are one transaction. A receipt allocation is not reused across events, and it carries the settlement deadline the paying agent sets. Which account parties may sign the delegation is the cash registry's policy for `AllocationFactory_Allocate` on that account. Splice 0.9.4's `TradingAppV2` restricts its delegation to accounts without a provider. For a provider account, the cash instrument must accept a receipt allocation whose single actor is one account party, because `ensureIsReceiptAllocation` requires `actors == [receiver]`; the test cash token of §10 does. The delegation is a template of the reference registry, not a sixth interface: the standard requires only that the allocations exist at settlement (§12.5).

**Batches.** A batch pays entitlements of one event and is sized to the synchronizer's request limits, as correction batches are (§7). Its `SettlementInfo.id` is built from the event key and the batch number, and `SettlementInfo.meta` carries the three reference keys, so the V2 settlement itself names the event. An entitlement appears in a batch at most once. A leg whose receiver, instrument, amount or references do not match its entitlement fails the whole batch.

**The movement must complete inside the choice.** A transfer factory may return `Pending` when the receiver has to accept, and an allocation can settle as `AllocationResult_Pending`. A pending movement has moved nothing yet and may never move anything. Recording it as paid would be false, and recording it as in flight would need a later transaction to find out how it ended, which Daml cannot observe for an archived instruction. So both settlement choices MUST fail when a movement does not complete in the transaction, and nothing moves. Receipt allocations avoid the accept step for any V2 cash instrument whose allocation factory creates them at once. Canton Coin does (`ExternalPartyAmuletRules.daml`, `AllocationInstructionResult_Completed`), but only for basic accounts, with an owner, no provider and the default account id (`ensureBasicAccount "allocation.authorizer"`, Splice 0.8.3); a payable account held at a provider needs a V2 cash instrument that supports provider accounts.

**Redemption, step by step.** Retiring units needs the holder's authority (in the standard's reference token a holding is `signatory accountParties admin account, admin`), which neither the paying agent nor the admin has inside a settlement. The units and the cash are therefore two obligations, specified separately and joined where they can be:

- **The instrument is frozen before `recordTime`.** A choice body reads ledger time, while the snapshot is cut at record time (§5.1), and Canton lets the two differ by up to the synchronizer's ledger-time/record-time tolerance (60 seconds by default). The freeze therefore starts at `recordTime` minus that tolerance, taking the largest tolerance in force between the freeze start and `recordTime`, since it is a dynamic synchronizer parameter. From then, by ledger time, every choice of the registry's own templates that moves the instrument MUST reject the movement unless it goes to `cip-112/burn`. This applies to every such choice and not only the factories, including accepting a transfer instruction created earlier and settling or executing an allocation that already exists. A transaction recorded after `recordTime` has a ledger time after the freeze starts, so none moves the instrument across the record time. The account that held at the record time therefore still holds at payment, and no buyer after the record time acquires units that are about to be retired. The freeze is the token-level form of the end of trading before maturity; the cost is that movements in the last tolerance window before `recordTime` are rejected too.
- **The holder side allocates the units.** Any one holder-side account party allocates the frozen holding to `cip-112/burn`, with the paying agent as executor, as `TestDeliveryVersusBurnMint` has the holder do. A pledged holding is first released by its lock holders; that release and the allocation may be separate transactions, because the freeze leaves the released units nowhere to go but the burn account.
- **The cash is settled in full,** by a settlement, to `payableTo`: the pledgee if the redirect's `kinds` include `EK_Redemption` or are empty, otherwise the holder.
- **Joined when possible.** Where the holder's allocation exists at settlement, the batch carries the burn leg in a second `SettlementCall`, on the serviced registry's settlement factory, beside the cash legs, so the units and the cash move in one transaction (delivery versus burn). Where it does not, the cash is paid alone and the registry executes the burn leg when the allocation arrives. An account with several slices has several redemption entitlements but one allocation: whichever settlement first finds the allocation executes the burn leg and consumes it, so the others find it gone and pay cash only. The order does not affect what anyone is owed, because the frozen units can only be burned.

**The cash comes from another registry.** The payment instrument usually has a different admin from the serviced one, so the cash legs settle on the cash registry's settlement factory, with that registry's choice context and disclosed contracts. The paying agent fetches them from the cash registry's own off-ledger API, as any executor or sender does (`POST /registry/allocation-instruction/v2/allocation-factory` and `POST /registry/allocation/v2/settlement-factory` for the batched path, `POST /registry/transfer-instruction/v2/transfer-factory` for the single path), and passes them in the `SettlementCall`'s own `extraArgs` or, on the single path, in `extraArgs.context` under a key the servicing package defines; the servicing registry's own entries sit beside them. The command carries the disclosed contracts of both registries.

**How a wallet sees the payment.** The payment appears in the token standard's own event log. The cash registry, as instrument admin, reports every change of holdings on every regular account with `EventLog_HoldingsChange` (CIP-0112 §4.3.5), so the receipt into `payableTo` is reported whatever this standard says. A wallet recognizes it as a servicing payment by the three keys on the `ReceiverSide` leg's `meta`. The standard requires the paying agent to put them on the legs; a registry built on `splice-token-standard-utils` carries them into the log, because `logAllocationSettlement` takes the logged legs from the allocation's own `transferLegSides`, `meta` included, and `logTransfer` copies `Transfer.meta`. `ensureIsReceiptAllocation` restricts `extraArgs.meta` only, so a receipt allocation may carry the keys on its leg. CIP-0112 does not require a registry to copy a leg's `meta` into the log; §12.7 asks the SIG whether it should. A redemption's burn leg is logged by the serviced registry with the same keys.

**The serviced instrument has to be in `meta`.** `eventId` is unique only within `(admin, instrumentId)`, and the transfer's own `instrumentId` is the *cash* instrument while its sender may be a delegated paying agent instead of the admin. Without the serviced instrument in `meta`, a reconciler holding the transfer has neither component of the pair. The three keys carry one value each.

**The reference is short strings, not a key.** `Metadata` is `TextMap Text`, and an `EntitlementKey` is a nested record holding an `Account` with `Optional Party` fields; encoding it would need a serialization this document would have to define, and would put party identifiers into a string every stakeholder of the transfer can read. The entitlement's `ref` (§4.2) is opaque and resolves against the registry, so neither problem arises.

The keys are prefixed with the CIP number, `cip-<nr>/`, until a number is assigned. This follows the V2 packages in Splice, whose own keys are `cip-112/extra-executors`, `cip-112/<field>.provider`, `cip-112/<field>.id` and `cip-112/expiresAt` (`tokenStandardV2Namespace` in `Conversions.daml`). CIP-0056 asks for a DNS-subdomain prefix that identifies the organization defining the key; `cip-<nr>` is syntactically one, and CIP-0112's text uses `cip-112/` for the mint and burn account ids but does not state the convention for metadata keys. §12.1 asks the SIG to confirm it.

**Contention** on the payment path is on the entitlements in a batch, on the receipt allocations, and on the paying agent's cash allocation. All of them belong to one event's payment run, so a run over 50,000 entitlements contends only with itself; two batches that list the same entitlement cannot both commit.

## 7. Corrections

Nothing is erased and nothing is mutated in place, but in Daml changing a field archives the contract and creates a new one. A correction therefore runs as follows:

1. The contract carrying `ES_Announced` or `ES_Confirmed` is archived, and a new contract for the same `EventKey` is created carrying `ES_Corrected { supersededBy }`. Both remain in the update history; only the second is active.
2. The corrected event is created with its own `EventKey` and `supersedes` naming the original. Both records can be written in one transaction: a key is a value and can be named before the contract exists.
3. Affected entitlements are archived and re-created with `ETS_Superseded { supersededBy }`; the replacement entitlements carry `supersedes` naming the superseded key. Both records have the same observers, so a counterparty reading its own participant sees the archive, the create, and the link in both directions. No separate signal is needed.
4. **What has been paid carries over.** The replacement's `paidAmount` is the superseded record's `paidAmount`, and the superseded record keeps it too, as history. So the replacement's `outstanding = netAmount - paidAmount` is what is still owed under the corrected terms, and the compensating payment is an ordinary settlement of the replacement, with no special payment type and no extra `meta` keys.

The amounts are distinct: the **original obligation** is the superseded record's `netAmount`; the **revised obligation** is the replacement's `netAmount`; the **amount already paid** is `paidAmount` on both; the **adjustment** is the difference of the two obligations; and the **outstanding** figure is the replacement's `netAmount - paidAmount`. An original obligation of 100, with 40 paid, corrected to 90, leaves 50 outstanding; it is not a recovery of 10. Repeated corrections chain the same way, each carrying `paidAmount` forward from the last.

**Overpayment is a claim, never a negative transfer.** Where `paidAmount` exceeds the revised `netAmount`, `outstanding` is negative: the registry has a claim on `payableTo` for the difference. The claim is represented by the replacement entitlement, whose figures state it, with the registry as creditor and the parties of `payableTo` as debtor. Nothing on the ledger enforces it, because the registry does not control the holdings it paid into. Recovery is the registry's own process. Both settlement choices reject any non-positive amount, so no implementation can pay a negative figure by mistake. The suite tests that both directions are represented, not that recovery succeeds.

**A correction that changes `recordTime`, `kind` or `payInInstrument` is a cancellation, not a supersession.** Steps 3 and 4 work only when the superseded and new entitlements have the same observers and are denominated in the same instrument. A new record time entitles parties that were observers of nothing, and they would see a create carrying a `supersedes` key they cannot resolve. A new `kind` changes which redirects catch the event (§4.3), so the slices, their keys and their observers change. A new `payInInstrument` makes `paidAmount`, paid in one instrument, meaningless against a figure in another. So a registry correcting any of the three MUST cancel the event and its entitlements (`ES_Cancelled` / `ETS_Cancelled`) and announce a new event.

**When.** The registry cancels the event first, as soon as it decides on the correction; the event's `replacedBy` is set then, because the new event's key can be named before it exists. From that moment no entitlement of the event can be paid: both settlement choices require the event live (§4.1, §4.2), and a cancelled event is not. The entitlements are then cancelled in batches sized to the synchronizer's request limits; an instrument with 50,000 holders cannot archive and re-create all its entitlements in one transaction. An entitlement's replacement cannot be named at cancellation, because which slices the new event has is known only after it derives. So the cancelled entitlements first carry `replacedBy = None`, and after the new derivation the registry re-creates each one that has a replacement, setting `replacedBy`, in the transaction that creates the replacement.

Consequences, because this case is not covered by the cancellation rule below:

- `ES_Cancelled` carries `replacedBy : Optional EventKey`, and `ETS_Cancelled` carries `replacedBy : Optional EntitlementKey`, so the link exists on-ledger in the forward direction for the parties who can see the cancelled record. The replacement event carries `supersedes = None`: it supersedes nothing, and reusing that field would give it two meanings.
- A cancelled entitlement names a replacement only where the new event has an entitlement for the same account and the same slice (the same `account` and `redirect` in the key). That replacement inherits the cancelled record's `paidAmount` where the two are paid in the same instrument, so money already moved counts toward the new figure. Where `payInInstrument` changed, it inherits nothing: the replacement starts unpaid, and the cancelled record's `paidAmount` is the registry's claim in the old instrument.
- A party entitled under the old record time and not under the new one sees its entitlement cancelled with no replacement. If it was already paid, the cancelled record's `paidAmount` is the registry's claim, by the overpayment rule above.
- A party entitled only under the new record time sees a first-time event and a first-time entitlement, with nothing on either marking it as a replacement; it could see neither cancelled record, so there is nothing on-ledger to link it to. The gap is intended: the context reaches it through the announcement endpoint (§8), which serves the cancelled event with its `replacedBy` alongside the new one.

Cancellation before payment: `ES_Cancelled`, entitlements `ETS_Cancelled`, nothing to compensate.

## 8. Off-ledger API

`servicing-v1.yaml`, at `/registry/servicing/v1/`. Shipped api-names drop the package's `token-` prefix, as `splice-api-token-transfer-instruction-v2` serves `/registry/transfer-instruction/v2/`. Reads are `GET` with pagination, as the metadata API's are; factory and choice-context endpoints are `POST` with a request body, as every shipped one is.

| Endpoint | Returns |
| --- | --- |
| `GET /registry/servicing/v1/instruments/{instrumentId}/events` | `ListEventsResponse`: `LifecycleEventView` values as plain data, filterable by status and time, with `pageSize` and a next-page token. Served as data: §4.1 keeps the event's observers narrow, so there is no contract to disclose. For display; the authoritative terms are on each entitlement |
| `POST /registry/servicing/v1/redirect-factory` | `RedirectFactoryWithChoiceContext`: the factory and its choice context in one response, as `POST …/transfer-factory` returns `TransferFactoryWithChoiceContext`. Builds the register first if it does not exist (§4.3) |
| `POST /registry/servicing/v1/redirect-instructions/{id}/choice-contexts/{approve\|reject\|withdraw}` | `ChoiceContext`. The approve context for the completing approval includes only the register as a disclosed contract: no holding reaches the beneficiary, and no cap is checked against the position on either side of the interface (§4.3) |
| `POST /registry/servicing/v1/redirects/{id}/choice-contexts/revoke` | `ChoiceContext`, carrying the register as a disclosed contract for a completing revocation. Needed because a revocation completes on a call by the beneficiary's owner, which is an observer of the register only through disclosure. The shipped standard serves contexts for choices on a live object the same way: `/registry/allocations/v2/{allocationId}/choice-contexts/{withdraw\|cancel}`. `_Expire` needs none: the admin signs the register and reads it locally |
| `POST /registry/servicing/v1/entitlements/{ref}/choice-contexts/settle` | `ChoiceContext` with the servicing registry's own entries (the event contract for the liveness check and, for a redemption, the allocations), for a paying agent that is not the admin. The paying agent adds the cash registry's transfer-factory context to it (§6). Addressed by the opaque `ref`, so the path names no party |

Redirect instructions and live redirects sit under separate segments because both are addressed by id under one api-name, and an id alone would not say which of the two it names.

Source: `splice-api-token-metadata-v1/openapi/token-metadata-v1.yaml:13,31-63` (GET reads, pagination); `splice-api-token-transfer-instruction-v2/openapi/transfer-instruction-v2.yaml:13-120`; `splice-api-token-allocation-instruction-v2/openapi/allocation-instruction-v2.yaml:13-115`.

**No endpoint lists an account's entitlements.** The standard's off-ledger API serves factories and choice contexts; holdings are read from the Ledger API, and an entitlement whose observers are the account parties is readable the same way. A second source of truth for the same figures would recreate the reconciliation problem this proposal removes.

**Client code.** Reading events and entitlements, and recognizing a servicing payment by its keys on an `EventLog_HoldingsChange` leg (§6), is what every wallet and custodian application needs, so that code is written to the structure of the Wallet SDK (`canton-network/wallet`, which already carries `token-standard-v2` and a transaction parser) and proposed there, with the client for `servicing-v1.yaml` generated from the OpenAPI as the SDK generates its others. The field-by-field comparison of §5.5 and §10 is needed only to evidence the standard, and stays a separate `dpm` component.

## 9. Privacy analysis

| Who | Learns | Already knew? |
| --- | --- | --- |
| Registry | holdings at record time, entitlements it derives, what it has paid | yes: it is the instrument admin and the payer |
| Registry, from a redirect | that a beneficiary exists, its identity, the scope and window | **new** |
| Holder's provider | its client's entitlements and receipts; every redirect on its client's position, with the beneficiary's identity and account | entitlements follow existing holdings visibility; beneficiary identity is **new** |
| Beneficiary | the entitlement payable to it: the pledged slice (`unitsAtRecord`), its gross, the deductions applied and their stated `source`, what has been paid, and `holderAccount`. Under an uncapped redirect the slice is the whole position, so the beneficiary learns the holder's position at every record time | **new**; the slice it already knows from the agreement, the deductions it did not |
| Beneficiary, on approving or revoking | the register's whole payload (`committedUnits`, `liveCount`, `uncappedLive`, `nextPriority`), because it is disclosed and a disclosed contract carries its full create argument. It therefore learns that other financing exists on the position, how much is committed ahead of it, and how many redirects have ever completed there, but not who provided it or on what terms. It does not see the position directly, but a beneficiary whose slice later falls short of its cap knows the position is what the redirects ahead of it took plus its own units, and from `committedUnits` it has a fair estimate of the first | **new**; aggregate, but enough to bound the position under a shortfall (§4.3, §5.1) |
| Beneficiary's provider | the holder's identity, account and pledged slice, as an account party of `payableTo`; and the register's payload, as the row above, whenever it is the beneficiary-side party that approves | **new** |
| Paying agent, where delegated | every entitlement it settles | **new**, and necessary to settle |
| Holder | its own entitlements and the redirects it authorized | — |
| Other holders of the instrument | nothing: the event's observers are narrow (§4.1), so the holder register is not disclosed | — |

**Five disclosures worth naming separately.**

1. **The deductions reach the beneficiary and its provider.** `Deduction` carries `rate`, `basis` and a free-text `source`, and they are observers of the entitlement, so a party with no relationship to the holder learns its withholding rate and the stated reason, which is a tax-residence and status signal. A registry that wants this narrowed can put the deduction detail only on the holder's own share and give the redirected slice the net figure; the cost is that the beneficiary can no longer check the deduction. That trade-off is part of the Milestone 1 gate.
2. **Both providers learn the other side.** The holder's custodian learns who financed its client; the beneficiary's custodian learns whose collateral it receives income from.
3. **`agreementRef` is a stable correlator.** It reveals nothing about the agreement's terms: the registry cannot fetch a contract in an application it has no visibility into. But the same `agreementRef` across several holders' redirects tells the registry those holders are financed under one facility, and the same id in any later disclosure links the two records. An application that wants the link broken should use a per-holder opaque reference and keep the mapping off-ledger.
4. **Timing.** Creation, `fromTime` / `toTime`, `priority` and revocation tell the registry when a financing opened and closed, per position, whether or not an entitlement is ever derived.
5. **The position, in two cases.** An uncapped redirect's beneficiary sees the holder's whole position at every record time, because its entitlement is the position. A capped redirect's beneficiary that receives less than its cap learns, with the register's `committedUnits`, roughly what the position was. A holder that wants its position kept from a financier uses a capped redirect set below the position.

**Milestone 1 privacy review.** The disclosures above are put in writing to at least one custodian and at least one buy-side holder. Each is asked whether it would permit a client position to be pledged under these conditions, with a yes/no answer and reasons. The answers are published either way. If either rejects the arrangement, the gate fails and the Committee decides on the remaining scope and budget.

**Proposed fallback if the disclosure model is rejected.** The beneficiary account is owned by the holder's provider (`owner = provider`), so `accountParties` reduces to `[provider]` and the financier is not named on-ledger. An account held at that provider but owned by the beneficiary would still identify the beneficiary. In this setup, the registry learns that a provider-owned account received income, but not who the financier is. The holder's provider already has the relevant information. There is no separate beneficiary's provider, because the holder's provider is the payee. The holder's provider then pays the financier under its existing client agreement.

The financier does not appear on the ledger, so the cross-provider case (the pledgee's income arriving at a second custodian, which reconciles its receipt to an entitlement it can read) is not demonstrated. The registry-against-provider comparison of §5.5 still is. The Funding section sets out the proposed adjustment; the Committee decides on it once the gate results are published.

## 10. Demonstration setup

The Milestone 5 demonstration uses five parties, including two account providers, with a redirect from the holder's account to the pledgee's:

```
                    Registry R  (instrument admin, paying agent)
                        │ signs holdings, events, entitlements, redirects, registers
        ┌───────────────┴──────────────────┐
  account A                          account B
  owner    = Holder H                owner    = Pledgee P
  provider = Custodian C1            provider = Custodian C2
        │                                  ▲
        └── redirect: coupons on up to N units of A ──┘
```

Five participants: R, H's wallet, C1, P and C2 each submit from their own, and each command acts as one party. The redirect is built in two to four commands, one party each: H proposes; C1 approves, if R's account policy asks for the provider; P approves; C2 approves if the policy asks, and whichever approval is last completes the redirect against A's register. A revocation is one command by P; a request by H, C1 or C2 is recorded and waits for P.

| Party | Operates | Observes |
| --- | --- | --- |
| R | the registry application | everything it signs |
| C1 | a custody application on its own participant, which for the demonstration that evidences the standard is neither operated nor authored by PixelPlex | A's holdings, A's register, the redirect, both entitlements on A and the `paidAmount` on each as it is settled, and the holder's receipt into A |
| H | a wallet | the same as C1, as account party of A |
| P | a collateral application | the redirect, the redirected entitlement on A and its `paidAmount`, the receipt into B, the register by disclosure on approving or revoking |
| C2 | a custody application | the redirect and the redirected entitlement, as account party of B; the payment into B |

What is compared, and by whom: R against C1 on both entitlements on A (units, split, gross, deductions on a gross or remaining basis, net, payable account, and what was paid on H's own share; §5.5). These are the two independently operated applications the acceptance criterion names. P against R on what was paid on the redirected slice, against the receipt into B. P and C2 check only the redirected entitlement's arithmetic, because neither can see A's position.

The demonstration does not cover a multi-tier omnibus chain, where the registry sees only a custodian's aggregate account and the custodian allocates to its clients off-ledger. There the registry cannot derive a beneficial owner's entitlement, because it cannot see the beneficial owner; that sub-allocation is the custodian's own and out of scope. Here every account is at the registry, with its provider recorded on it, which is the custody relationship CIP-0112 makes explicit.

**The payment instrument.** Settlement runs over receipt allocations (§6). H and P each sign the receipt-only delegation for A and B during setup, so the paying agent creates their receipt allocations for every event and the coupon arrives without an accept step. A and B are provider accounts, which Canton Coin does not support, so they are paid in a test cash token issued by a second registry built on the same V2 holding layer as the reference registry, whose allocation factory supports provider accounts. The demonstration also pays one coupon in Canton Coin, through a receipt allocation, to a separate holder on a basic account, so settlement is shown on a payment instrument already live on MainNet.

A redemption runs on the same accounts: the instrument frozen from `recordTime` minus the tolerance (§6), the pledge released and the units allocated from A to `cip-112/burn` by H or C1, and the cash to B where the redirect's `kinds` include `EK_Redemption` or are empty (§6).

## 11. Conformance suite

`cn-servicing-test` will follow the pattern used by the shipped `splice-token-standard-v1-test` and `splice-token-standard-v2-test` packages. A third-party registry will copy the package and run it against its own templates.

`V2_VALIDATION.md` describes the initial validation of the V2 standard against the `token-standard-v2-daml-preview` branch and states that small refinements may still occur. It shows that this test-package form is what registries are asked to run.

Scenarios, each asserting field-by-field equality on the fields §5.5 marks derivable:

1. Coupon to a plain holder on a basic account (no provider).
2. Coupon to a pledged holding with a redirect, beneficiary at a different provider, the redirect built by one party per command (proposal, each approval and the completing approval each submitted as a single party, as from its own participant). A redirect approved by both providers but not by the holder account's principal does not complete, including where the beneficiary account is owned by the holder's provider.
3. Holder, account provider and beneficiary as three parties: the provider recomputes every field of every entitlement on the position, including the split.
4. Partial redirect via `unitsCap`: two entitlements for one account, `unitsAtRecord` summing to the position.
5. Two redirects from one account to the same beneficiary account: two entitlements with distinct keys, each naming its redirect.
6. A register exists for an account that has never had a redirect proposed, created by the registry's own command and not inside a transfer to the account. Two concurrent *completing approvals* of capped redirects on that position, including the first two on it: one commits, the other fails on an inactive contract and succeeds on retry; where one of the two is uncapped, the retry is rejected instead. Afterwards exactly one live register exists per position, with aggregates matching the §4.3 table.
7. A completion while an uncapped redirect is live, and an uncapped completion while any redirect is live: both rejected on-ledger, not retryable, including where the two redirects' kinds or windows do not overlap. An uncapped redirect proposed without `toTime`: rejected. Capped redirects whose caps together exceed the position: completed, because §4.3 does not check that, and then allocated by scenario 9.
8. A holder-side revocation call recorded as a request, the redirect still `RS_Live`; a call by the beneficiary's provider recorded as a request too; a call by the beneficiary's owner completing it, asserting a successor carrying `RS_Revoked` and the register decremented; `_Expire` after `toTime`, asserting the register decremented and a successor carrying `RS_Expired`; an `_Expire` before `toTime`, and one on a redirect with `toTime = None`, both rejected.
9. A position that has fallen below the committed caps: the holder's share absorbs the shortfall first, the lowest-priority redirect second.
10. The snapshot: a redirect completed after `recordTime` with `fromTime` before it does not catch the event; a redirect revoked after `recordTime` does; holdings created and archived on each side of `recordTime` counted per §5.1.
11. Settlement: a batch over several entitlements of one event, paid in full; partial payment and then the rest; resubmitting a batch that already committed fails and moves nothing; two concurrent batches listing one entitlement, one fails; an entitlement listed twice in a batch, a leg whose receiver, instrument, amount or references do not match its entitlement, and an entitlement of another event, each failing the whole batch; an allocation that would settle as `AllocationResult_Pending`, and a single-path transfer that would complete as `Pending`, each aborting with nothing moved; after a payment, an `EventLog_HoldingsChange` on the payable account whose `ReceiverSide` leg carries the three reference keys; a receipt-allocation delegation used to create a sender-side allocation, rejected; an amount above `outstanding`, a non-positive amount, a partial settlement of a redemption, and a settlement by a party other than the paying agent, all rejected.
12. Redemption of a pledged holding: a transfer of the instrument after the record time rejected, and one whose ledger time falls inside the tolerance window before `recordTime` rejected too; the lock released and the holding allocated to `cip-112/burn` by one holder-side party; the cash to the pledgee under a redirect covering `EK_Redemption`, burned and paid in one batch with the burn leg on the serviced registry's settlement factory; and, separately, the cash paid before the allocation exists and the burn executed when it arrives.
13. Correction after partial payment: obligation 100, 40 paid, corrected to 90: the replacement carries `paidAmount` 40 and settles 50; the counterparty follows the supersession from its own participant.
14. Correction after full payment, overpayment direction: paid 100, corrected to 90: `outstanding` is −10, represented, and no transfer is made.
15. A settlement and a correction submitted concurrently on one entitlement: exactly one commits, and the outcome satisfies scenario 13 or 14.
16. Cancelled event before payment.
17. Corrections that change `recordTime`, `kind` or `payInInstrument`, after payment: each a cancellation with `replacedBy` set and a re-announcement; a replacement inheriting `paidAmount` where the payment instrument is unchanged and starting unpaid where it changed; and a cancelled entitlement with no replacement standing as a claim.
18. A position with holdings on a second synchronizer, or unassigned in flight, at the record offset: derivation refused for that position, while the event's other positions are derived.
19. Rounding: the §5.6 vectors, exactly; `decimals` outside 0..10 rejected; a product at 10^18 rejected.
20. Across parties: every entitlement of one event carries `terms` equal under the derived `Eq` (§4.0).

Pinned per Splice release in CI, the current one and the previous one.

## 12. Open questions for the Token Standards SIG

1. **Package names and home.** The draft uses the neutral working names `cn-servicing-api-v1` (five interfaces) and `cn-servicing-test` (the conformance package), so as not to be confused with the Splice packages of the token standard. We propose both to `canton-network/splice` beside `splice-api-token-*` and keep them in our own repository until merged. The final names, and whether the packages belong in Splice, are the SIG's call. We also prefix our metadata keys with `cip-<nr>/`, as the V2 packages in Splice prefix theirs with `cip-112/` (§6); is that acceptable under CIP-0056's rule that a prefix identifies the organization defining the key?
2. **Does `recordTime` belong on the event, or does the standard want an explicit snapshot object?** We chose an instant plus the ACS-at-offset rule in §5.1. A snapshot contract would be auditable on-ledger but is O(holders) contracts per event, on top of §4.2's per-entitlement cost.
3. **Should entitlements be on-ledger contracts, or an off-ledger derivation with a signed digest on-ledger?** We chose on-ledger because the entitlement is what parties disagree about, a digest cannot be reconciled field by field, and a digest cannot be consumed atomically with a payment. §4.2's storage cost is the argument on the other side.
4. **Is a narrow-observer event plus denormalized `EventTerms` the right shape** (§4.1)? The choice is between a holder-register leak and duplicating terms on every entitlement, and duplication leaves one consequence we cannot remove from inside this package: no single party can check its copy against the source. A standard disclosure mechanism for instrument-level announcements would resolve it, and would be needed before an elections extension, where a holder acts on terms before any entitlement exists.
5. **The receipt-only delegation.** Settlement needs a receipt allocation for each payable account (§6). We follow `TradingAppV2` and keep the delegation a template of the registry, checked with `ensureIsReceiptAllocation`, so the standard requires only that the allocations exist. Should the standard define the delegation as an interface instead, so a wallet can show and revoke it the same way at every paying agent?
6. **Should there be a batched entitlement?** One entitlement per holding account is what lets an account provider read and check its clients' lines one by one, but it makes storage and traffic grow with the number of holders (§4.2). An alternative is one entitlement per account provider, listing its clients' lines, which would cost fewer contracts and transactions but would show every client of that provider in one contract to everyone who observes it. We chose one entitlement per account and ask whether the SIG wants the batched form as well.
7. **Leg `meta` in the event log.** A wallet finds a servicing payment by the reference keys on the leg of `EventLog_HoldingsChange` (§6). The Splice utilities copy a leg's `meta` from the allocation or transfer into the log, but CIP-0112 does not require it, so a registry written without them may drop the keys. Should CIP-0112 require `EventLog_HoldingsChange` legs to carry the `meta` of the allocation or transfer leg they report?

## 13. Deliberate limits and extensions

**Extensions**, each a separate package on top of this one, reusing its keys, leaving its interfaces as they are, and carrying what it adds in interfaces of its own:

- **Holder elections**: cash or stock, participate or not. Needs typed option sets, quantity limits across elections, defaults, withdrawal and amendment, and what corrections do to a pending election; and the disclosure mechanism of §12.4, because a holder acts before any entitlement exists.
- **Unit changes**: splits and consolidations. An extension entitlement interface can state a unit result, but delivering it depends on whether the registry's holdings are admin-signed or jointly signed: in the standard's own reference token a holding is `signatory accountParties admin account, admin`, so the admin cannot re-issue unilaterally, and standardizing across both models needs a propose-accept path per holder.
  Source: `examples/splice-test-token-v2/daml/Splice/Testing/Tokens/TestTokenV2/Holding.daml:20-25`.
- **Partial redemption**, which needs a per-holding factor and a rule for which units are burned.
- **Residual allocation against a funded total**: a funded total on an extension event interface and a rule giving the rounding residual to holders. It needs a ranking every party can verify, which §5.4's per-entitlement locality cannot provide.
- **Securities-lending equivalent payments**: an obligation owed whatever the borrower's account holds (§4.3, "What a redirect is"), with its own source and debtor.
- **Mergers, spin-offs, rights issues**: events that create or exchange instruments.

**Limits of version 1:**

- **No market claims.** A trade agreed before `recordTime` and settled after it does not move the entitlement: the snapshot pays the account that holds at the record time. Compensation between trading counterparties is the trading application's business. §5.1.
- **No recovery of overpayment**; the claim is represented. §7.
- **No tax computation.** §5.3.
- **No cross-synchronizer derivation**; the registry holds back the affected position rather than under-paying it, and derives the rest. §5.1.
- **No sub-allocation inside an omnibus account.** §10.
- **Redirect exclusivity is per position, not per scope.** §4.3.
- **Settlement only by a movement that completes in the transaction.** §6, §12.5.
- **Record date as a calendar convention is out of scope**; the ledger has instants. §4.1.

## 14. Risks

| Risk | Mitigation |
| --- | --- |
| A participant hosting a party to an event, entitlement or redirect has not vetted `cn-servicing-api-v1` or the registry's implementation package, so transactions involving that party fail | the Milestone 2 operator guide (upload with `vetAllPackages = false`, vet through `/v2/package-vetting/update`, check through `/v2/package-vetting/list`); the Milestone 5 demonstration runs on five participants that each vet the packages themselves; if Splice ships the package with its releases (`DarResources`), the manual step goes away |
| The redirect disclosures are unacceptable to custodians or holders | Milestone 1 gate with a written yes/no test, published either way; the Committee decides the remaining scope and budget, with a designed fallback and its price proposed (§9) |
| Two implementations round differently and the standard forks | §5.2 pins the arithmetic to a single rounding, at the LF target the standard is built for; §5.4 keeps every figure local to its entitlement; vectors publish at Milestone 2 |
| A payment is made twice, or recorded without being made | settlement and its record are one transaction (§6); the suite's scenarios 11 and 15 exercise retry, concurrency and a racing correction |
| Per-entitlement storage and traffic cost deters adoption at scale | both estimated in §4.2, with views and bytes measured at Milestone 3; the digest alternative and a batched entitlement are put to the SIG (§12.3, §12.6) rather than assumed away |
| The cash instrument cannot create a receipt allocation for a provider account (Canton Coin supports basic accounts only), so a pledged entitlement cannot be paid in it | stated as a limit: the pledged case needs a V2 cash instrument with provider accounts (§6, §10); no unverifiable in-flight state is introduced to cover it |
| A flow needs parties hosted on different participants to act in one command | none does: every choice is callable by one party, and approvals accumulate on a pending instruction (§4.3); scenario 2 runs the redirect flow one party per command |
| The token standard moves to a newer Daml-LF target (Splice `main` already builds some packages for LF 2.3) | the package follows the target the shipped `splice-api-token-*` packages use, and CI pins the current and previous Splice release |
| The CIP-0112 Daml API is still in a validation phase | `V2_VALIDATION.md` states refinements may still occur; the package pins two Splice releases in CI |
| The SIG directs the design differently | milestones are adjusted with the Committee rather than delivered against a superseded draft |
| No independent adopter appears | half of the funding is paid only per independent adopter, and 900,000 CC of it (37.5% of the request) only for use in production on MainNet |
