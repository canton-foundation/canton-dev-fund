> **INTERNAL DRAFT v3, revised 2026-11-21 — do not submit. Remove this box before sending
> to Canton.**
>
> **Changes in v3.** §2 was measured against the code rather than restated, and it had gone
> badly out of date. It claimed 430 lines of Daml, 85 of them asset-backing, and "no burn
> anywhere. No redeem choice either." The contracts today are **1,259 lines across six
> modules and eleven templates, with 1,958 lines of tests**, and `Redemption.daml` alone is
> 539 lines with 904 lines of tests against it. `InstrumentSupply` — which v2 called "the
> single most important correctness deliverable in the proposal" and listed as not built —
> is built and consumed by every mint and every burn.
>
> - **Repriced down: $355,000 / 3,645,000 CC, from $450,000 / 4,620,000 CC.** The $85,000
>   redemption line is removed entirely and the `InstrumentSupply` half of the $40,000
>   governance line with it. Build track $300,000 → $205,000; adoption unchanged at
>   $150,000; duration 22 → 19 weeks.
> - **The audit line goes up, $55,000 → $70,000**, and is now the largest item. The surface
>   to audit roughly tripled, and the largest addition is the redemption module, which is
>   the code that moves value out of the reserve. Scoping the audit to the old codebase
>   would be the cheapest way to make this look smaller.
> - **Both delivered items move into the co-investment table**, described as withdrawn from
>   the ask rather than invoiced against it.
> - **The activity-marker work is claimed for the first time.** It appeared in v2 three
>   times, all incidental. The economic-event derivation is generic to any CIP-56 issuer,
>   carries 42 tests, reads without a ledger, and is published with its method — it is the
>   strongest RFP-11 evidence in the document and v2 did not use it.
> - **New section "Direction after this grant"**, explicitly unfunded: OTC settlement on the
>   issuer's own node (which is the funded allocation work pointed at a second use),
>   position netting, reserve-backed instruments as lending collateral, further single-metal
>   instruments.
> - Abstract, acceptance criteria, milestones B1–B3, the FTE basis and the Kaiko/DA
>   calibration all restated against the new §2.
> - The supply-gap disclosure in the Rationale is kept rather than deleted now that the bug
>   is fixed, and says why.
>
> **Still blocking submission, and none of these are writing:**
> - [ ] **Audit quote.** $70,000 is still an estimate, and it is now 34% of the build track.
>   Get a written quote before this goes in.
> - [ ] **ENTITY — this is now the blocker, and it is bigger than which entity receives the
>   grant. Do not submit until it is answered.** Found by arulocal against
>   `brain/entity-roles.md`, verified here. Two separate conflicts:
>
>   **(a) The document gives Hawkrel the one role the canonical reference forbids it.**
>   "Ownership and maintenance" opens with *"We run on it. Hawkrel issues its own instruments
>   with these contracts and operates the validators they run on"* — and that is the argument
>   the section itself ranks first. `entity-roles.md` gives Hawkrel's never-list as "ANY
>   OPERATING ROLE. Never procures, quotes, trades, holds reserve assets, receives redemption
>   fees, or appears in any payment chain to holders", and assigns "Issue / redeem ARU" and
>   "Approve mint/redeem NAV and price" to **Vantara**, with "take title on delivery and hold"
>   and "named client on custody agreements" to the **Foundation**. The contracts have already
>   taken that side: `MintBatch` and `InstrumentSupply` are parameterised on `issuer` and
>   `reserveHolder`, which map to Vantara and the Foundation. **Hawkrel is neither on-ledger
>   party.** The header also names Hawkrel as Organization.
>
>   If the intent is that Hawkrel receives the grant and holds the IP while Vantara issues and
>   the Foundation holds title, then the fix is narrow and costs nothing: the co-investment
>   claim is *stronger* under that reading, because funding and licensing is exactly what an
>   equity-and-IP vehicle does, and "the group runs on it" is as good a maintenance argument
>   as "Hawkrel runs on it" and has the advantage of being true. **But that is a structuring
>   decision, not a drafting one, and it has not been made here.**
>
>   **(b) Three documents give three different issuers for the copper token.** The proposal's
>   own reference instrument is ARU-CU. `entity-roles.md` (last touched 2026-08-03) marks
>   **Lanthic** *"(proposed, not adopted)"*. `brain/biggest-insights.md` records on 2026-11-18
>   that single-metal tokens are branded **under Lanthic** (Lanthic Copper, tickers LCU / LUR
>   / LTI), with a copper launch targeted for **30 November**. A counterparty was told in
>   writing on 2026-11-09 that Lanthic (US) is the issuer of the copper token on Canton. This
>   proposal names Lanthic **zero times**. Any of the three may be the stale one — that is
>   precisely why it cannot be settled in this draft. It also touches the Lanthic-rename and
>   trading-entity items already open.
>
>   Full write-up: `brain/devfund-proposal-code-audit-2026-11-21.md` §8.
>
> - [ ] The CIP-0116 featured-app lock recipient, which was the original form of the entity
>   question. Flagged urgent on 2026-10-06, still open, and a lender is waiting on it.
> - [ ] **Champion.** Evan's confirmation to be named. His public PR comment is quoted and
>   is safe to cite without it.
> - [ ] Fill the two `«TODO»` figures — engineering spend to date, and the CC/USD rate on
>   the submission day. The spend figure is now carrying the co-investment argument for a
>   request that has three delivered items in its left column, so it matters more than it did.
> - [ ] Custodian names still conflict across proposal, whitepaper v4 and the site.
> **Reviewed by arulocal against all 1,259 lines of `main/daml` at 70d17ff.** Every figure
> reconciled; all five net-new items confirmed unbuilt with file-and-line evidence. Four
> things it caught, all now fixed here:
>
> - **"A NAV tolerance" was an overclaim counted twice** — as built in the weighting
>   paragraph and as net-new in the dual-control row. `minProceeds` is explicitly "the
>   redeemer's half of the NAV tolerance band" and `navApproved` is a bare `Bool`: there is
>   no issuer-side band and no maximum deviation. The real built deliverable in its place is
>   `supplyAtApproval` — proceeds record the supply they were priced against and execution is
>   refused if supply has moved, the mirror of the mint path's declared-supply bind.
> - **The marker claim was overstated.** "Generic to any CIP-56 issuer, nothing
>   commodity-specific" is true of the *derivation* and false of the *band table*, whose top
>   threshold is 100,000 tokens — about 100 t of copper here, $100,000 on a 1:1 stablecoin.
>   Split into two claims, which is the stronger form: the calibration against a physical
>   unit is *why* the weights are recomputable without trusting our price feed.
> - **The OTC framing was wrong.** Allocations are necessary but not sufficient:
>   quote-and-acceptance is net-new templates, and atomic DvP additionally needs the
>   *settlement asset's own registry* to implement allocations, which we cannot do
>   unilaterally. Now stated as a dependency rather than glossed over — it is the first
>   question a technical reviewer would ask.
> - **Two stale comments in the shipped contracts**, fixed in aru-daml `beea668`:
>   `Issuance.daml` still said "nothing in this package burns. Redemption is a separate
>   workstream" (almost certainly the origin of v2's "there is no burn"), and `markers.mjs`
>   asserted the band endpoints "ARE the incumbent's" on 12-hour figures the 2026-11-17
>   census superseded. They sit inside Ember's range, not at it — the safer claim.
>
> It also supplied what v2 never claimed at all and v3 now does: `Events.daml` as its own
> RFP-11 argument, and `verify.mjs` (945 lines of live-ledger adversarial acceptance,
> including the ledger refusing a mint where the issuer attested to itself).
>
> Future-direction additions are arulocal's: **intraday settlement**, which Chris decided on
> 2026-10-11 and which lands on the attestation-freshness and execution-deadline machinery
> directly, and **DvP venue listing**. Cross-chain is deliberately left out on its advice —
> real, but it invites a scope question this grant cannot answer.
>
> Full evidence: `C:\dev\aru\brain\devfund-proposal-code-audit-2026-11-21.md`.
>
> ---
>
> Changes in v2 (2026-10-06), after reviewing the 55 merged Dev Fund proposals and the new
> Dev Fund 2.0 review process:
> - **Public Good reframed.** Leads with asset-agnostic infrastructure (one package, one
>   transfer factory, two instruments) rather than with ARU the token. "Public Good — a
>   shared asset for the ecosystem rather than primarily benefiting a single organization"
>   is a named evaluation principle and was our largest exposure.
> - **Defensible claim moved** to reserve attestation and proof-of-reserves. DA's Token
>   Standard V2 (12M CC) and OpenZeppelin's Contracts Library (28.4M CC) will both ship
>   audited CIP-56 implementations; "a reference implementation of the token standard" is
>   no longer a differentiator. Conformance is now framed as compliance with their work.
> - **New §2 "What already exists vs. what is net-new"**, the pattern from the approved
>   Kaiko Data Standard (900K CC). We have more deployed than Kaiko did at approval.
> - **Co-investment with a fixed USD reference**, the structural change the grant team
>   demanded of Hacken (v4: Fund 62%, Hacken 38% in-kind).
> - **Repriced: $450,000 scope value / 4,620,000 CC, up from $175,000 / 1,800,000 CC.** The
>   old figure did not fund a real audit. Costed bottom-up, cross-checked against ~3.0 FTE
>   over the 22-week build track (the basis RedStone states), and calibrated against Kaiko
>   at 900,000 CC for a specification with no audit and no redemption path.
> - **Split shifted to two thirds build / one third adoption** (was 50/50). The build track
>   carries the whole of redemption — which does not exist in any form — plus an audit that
>   is a hard cash cost. An even split left the audit nominally funded, which is worse than
>   not proposing one. Adoption milestones still use RedStone CAPS's three-way verification
>   so they can be met without publishing holder positions or custodian terms.
> - **§2 now states the weighting**: 430 lines of Daml exist, 85 of them the asset-backing
>   logic, two template choices, and no burn anywhere. Without this the credibility claim
>   ("already deployed") and the funding case read as contradicting each other.
> - **New "Ownership and maintenance after the grant"** section (Sustainability principle;
>   Kaiko §4).
> - **Temple's public endorsement quoted in the document**, not left in the PR thread.
>   OpenZeppelin quotes a ChainSafe testimonial inline; reviewers do not read PR threads.
> - **RFP and SIG citations corrected** to the roadmap's own numbering and the two SIGs.
> - **New "Relationship to adjacent Dev Fund work"** section, pre-empting "is this
>   duplicative?" and showing ecosystem fit.
> - `InstrumentSupply` added as an explicit net-new deliverable — see the note in §2.
>
> Still open before submission:
> - [x] File location: **update PR #87 in place.** `rfp-category-check.yml` triggers only on
>   `pull_request_target: types:[opened]`, `paths: proposals/**`, so it never ran on #87
>   and will not run again (reopening fires `reopened`). A new PR under
>   `rfps/financial-markets-standards-verification/` would also get no label — the path
>   filter excludes it. Updating #87 keeps the March filing date, the reviewer thread, and
>   Temple's public endorsement. Nothing is gained by refiling.
> - [x] Basket wording: whitepaper v4 three-sleeve structure, no weights (from arubrain).
>   Note: arureserve.com Docs page still shows the stale 60/28/12 split — fix the site
>   before resubmitting.
> - [ ] **Fill the two `«TODO»` figures in the Funding section** — ARU's engineering spend
>   to date, and the CC/USD rate on the submission date (the CC figures move with it; the
>   $450,000 scope value does not). The co-investment argument does not work without a
>   number, and it is now carrying more weight than before, because the ask is 2.6× larger.
> - [ ] **Sanity-check the $85,000 redemption line and the $55,000 audit line** against a
>   real quote before submitting. Those two are 46% of the build track, and both are
>   currently my estimate rather than anyone's price.
> - [ ] Custodian names left as in v1 (BFI/Loomis, Silver Bullion) — conflicts with
>   whitepaper v4 (BFI / SafeHouse–Silver Bullion / MetLock) and site (Loomis / The
>   Reserve / MetLock). Confirm executed agreements, or switch to generic wording.
> - [ ] RedStone: the ask has changed. RedStone's Canton project is **CAPS** (15,775,000 CC),
>   a price-fixing oracle standard — *not* proof-of-reserves. So there is no scope overlap,
>   and the right relationship is that our NAV consumes a CAPS root capsule. Confirm with
>   RedStone before citing them as the reference integration.
> - [ ] Audit firm. Hacken's own Dev Fund proposal prices their entire product build at
>   $125,000 USDT, so an audit of this scope fits inside the budget. Get a written quote.
>   Note Hacken ships a *Proof of Reserves Monitor* that needs on-ledger PoR attestations
>   to exist — worth approaching as an integration, not only as an auditor.
> - [ ] Temple: the **public** PR comment is quoted below and is safe to cite. Still need
>   Evan's confirmation to be named Champion, and permission before citing Temple's
>   unannounced single-metal plans (copper/tin/nickel/tungsten/molybdenum/gallium).
>   Separately: ask for a **Letter of Dependency** addressed to the Foundation committee.
> - [ ] Cantex / Full Sail: OK to name?
> - [ ] Entity: Hawkrel Inc. as grant recipient vs. issuer party (Vantara) for the CIP-0116
>   Featured App lock — escalate separately. Now urgent: a lender needs to know which
>   entity holds the locked position.
> - [ ] Ask a maintainer to apply the `rfp-12:rwa-standards` and `rfp-11:public-verifiability`
>   labels. #87 currently carries **no labels at all**; we cannot apply them ourselves.

## Development Fund Proposal

**Organization:** Hawkrel Inc. (ARU — Acua Reserve Unit)
**Author / Primary Contact:** Christoph Richter (Co-founder, ARU)
**Website:** [www.arureserve.com](https://www.arureserve.com)
**Status:** Draft
**Created:** 2026-03-14 (revised 2026-10-06)
**Proposal Type:** RFP-aligned
**RFP:** **RFP-12 — RWA Standards**, sub-area 12.2 *Daml and Institutional RWA Workflow
Standards*. Secondary: **RFP-11 — Public verifiability**.
**Roadmap Category:** Financial Markets, Standards & Verification
**SIGs:** Token Standards / Asset Standards (primary); Decentralized Attestor Pools /
DAOs and MultiSig (secondary — RFP-11 names decentralized attestor pools directly, and
reserve attestation is that pattern applied to physical custody)
**Champion:** Evan Varsamis (Temple Digital Group, @evarsamis) — *pending confirmation*
**Total Scope Value:** $355,000 USD (fixed at submission; CC derived)
**Development Fund Request:** 3,645,000 CC — $205,000 build, $150,000 adoption
**Hawkrel Co-investment:** work already delivered at own cost, plus ongoing operations
**Project Duration:** 19 weeks build track (~4.5 months); adoption milestones are undated
**Labels requested:** `rfp-12:rwa-standards`, `rfp-11:public-verifiability`

---

## Abstract

Canton settles tokenized treasuries, bonds, money market funds, and deposit tokens, and
spot tokenized gold and silver now trade on Canton venues. What is missing is an open,
reusable way to **issue and redeem** tokens backed by physically custodied assets, with
supply that is provably capped by independently attested reserves.

**This is not a theoretical proposal.** The core contracts are written, tested, and
deployed. They run on a Canton DevNet validator (since 2026-07) and a TestNet validator
(since 2026-09), where a dual-control mint has executed, holdings have been read back
through both the V1 and V2 token standard interfaces, and transfers have been instructed
and accepted over each version. The ledger refused the negative cases — a reserve holder
executing an unapproved mint, a sender accepting her own transfer — with the assertion
text from the contracts. All of that was built at Hawkrel's cost before any grant.

**The contracts are asset-agnostic, and that is demonstrated rather than asserted.** On
2026-10-05 a second instrument was issued on TestNet alongside the basket: **ARU-CU**, a
single-metal copper token of the shape a venue listing asks for. One Daml package, one
transfer factory, two instruments, distinguished only by the attestations they are minted
against. Nothing per-instrument exists on the ledger. A third issuer adds a configuration
entry, an attestation, and a mint — no new contracts, no fork, no assistance from us.

The two reference deployments are deliberately different shapes. **Single-metal spot
tokens** are the format Temple Digital Group has requested for listing, starting with
copper and tin. **ARU** is a diversified basket of physical metals spanning three sleeves —
precious metals, industrial metals, and strategic and critical metals including
platinum-group metals and uranium. Its constituents are set by a published, rules-based
index methodology (Hawkrel Inc., Index Methodology Rulebook) and rebalanced on a tiered
cadence by liquidity; the eligible universe covers up to 26 metals, with an initial launch
set of eight, and constituents may change under the published methodology. Neither shape is
privileged in the contracts, which is the point: a basket is a configuration, not a
different token.

**The full issue-and-redeem lifecycle is closed, and the supply cap is a ledger
invariant.** Both were built after this proposal was first filed, at our own cost, and both
have been withdrawn from the request rather than invoiced against it — §2 sets out exactly
what moved and what is left.

What this proposal funds is the distance between a working single-issuer system and
infrastructure anyone else can use: multi-party signer governance in place of our fixed
pair, a provider-agnostic attestation interface with multiple attestors, allocations
implemented against DA's V2 interfaces, the public verifiability layer published on-ledger
rather than served from our own host, an independent security audit, and documentation
sufficient for an unrelated issuer to deploy without us.

---

## Specification

### 1. Objective

Provide a reusable, audited issuance and redemption standard for physically backed assets
on Canton, so that any issuer can mint only against attested reserves and any venue,
lender, or counterparty can verify that backing.

Today every such issuer on Canton would build this from scratch:

1. **No issuance/redemption workflow for custody-backed tokens.** CIP-56 defines holdings
   and transfers, but not how supply of a custody-backed asset is created and destroyed
   under multi-party control. CIP-56 intentionally leaves this out.
2. **No standard reserve attestation interface.** Venues and counterparties lack a common
   way to check that token supply is covered by independently attested physical reserves.
3. **No public verifiability of the aggregate.** An aggregate published by the issuer is
   the issuer's own assertion. RFP-11 states the problem precisely: *"an aggregate value
   published by an issuer might not be trusted by the market."* Separating the attestor
   from the issuer is how that is answered.

### 2. What already exists vs. what is net-new

The grant funds the second column only. This section is deliberately specific, because
"already working" is a claim a reviewer should be able to check.

**The weighting, stated plainly so the left column is not mistaken for the whole job.**
What exists is **1,259 lines of Daml across six modules and eleven templates**, with
**1,958 lines of Daml tests** against them. The asset-backing half — issuance, reserve
attestation, and redemption — is 729 of those lines; `Transfer.daml` at 336 is
token-standard interface plumbing, the V1/V2 downcasts and the
archive-on-the-V2-path-only problem.

**The full issue-and-redeem lifecycle is closed.** A reserve-backed asset whose supply is
one-way is not infrastructure — a venue cannot list a token nobody can redeem — so that
half was built, at our own cost, after this proposal was first filed. `Redemption.daml` is
539 lines carrying the AP queue, a redeemer-set floor on proceeds, the burn, and the
whole request lifecycle including rejection, withdrawal and expiry; 904 lines of tests
stand against it. `InstrumentSupply` exists and every mint and every burn
consumes and recreates it, so the cap on supply is now an invariant the ledger enforces
rather than a figure the issuer asserts.

That matters for how this request should be read. **The two items this proposal previously
called its largest — the redemption half and the supply-accounting gap — are no longer
being asked for.** They are in the left column, and the funding request below is smaller
than the one originally filed because of it.

**What is still missing is, disproportionately, the part that serves issuers other than
us.** Everything built so far is what ARU needed for ARU, and a single issuer with one
attestor and one reserve holder needs neither N-of-M signer sets, nor rotation, nor
multi-attestor consensus, nor a provider-agnostic attestation interface, nor conformance
tests a stranger can run, nor documentation that works without us in the room. The
single-issuer version is the cheap version, and it is the one that is already done. The
multi-issuer version is the grant.

| Component | Status today | Net-new under this grant |
|---|---|---|
| **Minimal CIP-56 token** — holdings, transfers, sub-transaction privacy | **Built.** Implements the token standard on **both V1 and V2**, as Amulet does. Deployed on DevNet and TestNet. | Upgrade-compatibility discipline across versions; conformance test suite published as a reusable artifact |
| **Dual-control mint** — attestor signs what is held, issuer approves NAV, reserve holder executes; neither can act alone | **Built.** Enforced by the ledger, with both negative cases refused on a live network. | N-of-M signer sets and on-ledger signer rotation; batch windows (`MintBatch` mints to one recipient for one amount today — the name is not an aggregation); an **issuer-side NAV deviation band**, since `minProceeds` is the redeemer's half of that band and `navApproved` is a bare Bool with no maximum deviation; configurable approval policy |
| **Reserve attestation** — attested quantity, asset class, as-of time, freshness window | **Built.** `AllocatedMetal` vs. pending-procurement asset classes; a mint fails outside the attestation's freshness window. | Provider-agnostic attestation interface; multi-attestor consensus; assurance-firm attestations alongside oracle feeds |
| **On-ledger supply accounting** | **Built, and it was the gap this proposal named as its most important correctness deliverable.** `InstrumentSupply` is a contract every mint and every burn consumes and recreates, so a mint declaring an understated prior supply is refused by the ledger rather than by our tooling. | — |
| **Redemption and settlement** | **Built.** AP roster with revocation either side can exercise alone; `RequestRedemption` through a factory; the redeemer sets its own `minProceeds` floor and deadline; issuer prices, reserve holder settles, neither alone; burn-on-redeem recreating supply in the same transaction; rejection, withdrawal and expiry all returning the locked holding. Proceeds record the supply figure they were priced against, and execution is refused if supply has moved since — the mirror of the mint path's declared-supply bind, and the check that stops a redemption settling at a price computed for a different instrument state. Settlement asset is configuration, not code. 904 lines of tests. | Allocations (`splice-api-token-allocation-*-v2`) implemented against DA's V2 interfaces, so settlement executes against an allocation rather than a direct transfer — see "Relationship to adjacent work" |
| **Transfer factory and instructions** — two-step transfer with either side able to end it, one-step when both authorize | **Built.** Admin-scoped, so one factory serves every instrument. | — |
| **Registry service** — the token standard's off-ledger half: metadata, supply, and the disclosed contracts a wallet needs to submit its own transfer | **Built.** Read-only, holds no key that can move an asset. Responses validated against the standard's own OpenAPI documents. | Public aggregates endpoints; registry conformance published as a reusable check |
| **Operator view** — read-only page over the live ledger | **Built.** Deployed. Access-controlled. | — |
| **Economic-event derivation and activity-marker claiming** | **Built, and public.** A holdings change that carries a transfer leg is an economic event; locks, instructions and returns are not; movements with an ARU-controlled party on both ends are excluded. The rule is one file with no network, clock or filesystem access, carrying 42 tests, and it is reproducible by a third party from public ledger data without our cooperation. Published with its method at `apcanton.arureserve.com/markers`. | **Two claims, and they should not be merged.** The *derivation* — the structural rule and the reconciliation artefact — depends on nothing but Token Standard V2 event shapes, so any CIP-56 issuer inherits it unchanged; that is the half we propose upstream. The *weight table* is calibrated per instrument against a physical unit and does not port: its top threshold is 100,000 tokens, which is about 100 tonnes of copper here and would be $100,000 on a 1:1 stablecoin. That calibration is the design rather than a limitation — a kilogram-denominated band is bounded by a warehouse attestation, which is a third party's statement, where a value-denominated band would be bounded only by a price we publish, making the reward self-referential. Published as a reusable artifact and proposed upstream — see "Ownership and maintenance" |
| **Token Standard V2 holdings-change event log** | **Built.** `Events.daml`. `TransferEventsV2` obliges the instrument admin to explain every change to every regular account and both sides of every transfer; without it a generic V2 wallet can read a holding it already knows about but cannot learn that one appeared, moved, or went away. Our own pre-deployment review found it implemented but **not advertised**, so no V2 wallet would in fact have followed an ARU balance — found and fixed before deployment rather than after. | — |
| **Live-ledger acceptance suite** | **Built.** `verify.mjs`, 945 lines, run against the deployed package on a real network rather than in Daml Script — including the adversarial case in which the issuer signs its own attestation for a million, names itself as the batch's attestor, approves the NAV, and the ledger refuses the mint. A Daml Script suite structurally cannot establish that, because it cannot be wrong about which code is deployed. | Published as a conformance suite a third-party issuer can run against their own deployment |
| **Public verifiability layer (RFP-11), on-ledger** | **Partly.** Reserves, supply and coverage are published publicly today, but as a served view rather than as a contract. `InstrumentSupply` carries no observer at all — it is signed by issuer and reserve holder and visible to exactly those two — so the aggregate a third party reads today is our server's statement, not the ledger's. **No on-ledger aggregate exists at broad visibility**, and that gap is precisely what RFP-11 is about. | Total attested reserves, supply, collateralization ratio, per-asset breakdown and last-attestation time, published **on-ledger** at broad visibility, with **no holder positions** — see §3 |
| **Independent security audit** | **Not done,** and the surface to audit has roughly tripled since this was first scoped. | Full audit of the Daml contracts, findings and fixes published |
| **MainNet** | **Never deployed.** No version of this package has been on MainNet. | MainNet deployment of both reference instruments against live custody, price feeds and attestation |
| **Third-party deployability** | **Not proven.** | Documentation sufficient for an unrelated issuer to deploy a new instrument unaided, with that deployment as an acceptance criterion |

Every guard above is **mutation-tested**: each one is deleted on its own in a throwaway
copy, and the test that should catch it is required to fail while nothing else is allowed
to. This exists because early on every negative test passed while the happy path was
broken — a validator that cannot fail is decoration. The practice extends to the registry
conformance checks, the operator view's checks, and the activity-marker rule.

### 3. Implementation Mechanics

The design is **defensive by design**: keep the token contract minimal, move complexity
into surrounding modules, and require multi-party approval for every supply change.

```
                        COMMODITY TOKEN INFRASTRUCTURE
                        ==============================
                   ● built   ◐ partly built   ○ net-new

    ┌─────────────────────────────────────────────────────────────┐
    │              Module 5: Management interfaces                │
    │     ● operator view    ○ AP view    ○ public aggregates     │
    └────────┬──────────────────┬──────────────────┬──────────────┘
             │                  │                  │
    ┌────────▼────────┐  ┌──────▼─────────┐  ┌─────▼──────────────┐
    │  Module 1:      │  │  Module 2:     │  │  Module 4:         │
    │  Commodity Token│  │  Mint/Redeem   │  │  NAV + Reserve     │
    │  (CIP-56 V1+V2) │  │  Controller    │  │  Attestation       │
    │                 │  │                │  │                    │
    │ ● Transfer      │  │ ● Dual control │  │ ● Attestation      │
    │ ● Balance       │  │ ● Supply cap   │  │ ● Asset class      │
    │ ● Privacy       │  │ ○ InstrumentSup│  │ ● Freshness        │
    │ ● No mint/burn  │  │ ○ N-of-M sigs  │  │ ○ Oracle iface     │
    │ ○ Allocations   │  │ ○ Batch window │  │ ○ Multi-attestor   │
    │                 │  │ ○ Redeem/burn  │  │ ○ Public aggregate │
    └────────▲────────┘  └──┬──────▲──────┘  └────────┬───────────┘
             │              │      │                  │
             │  mint/burn   │      │ reserve + NAV    │
             │  execution   │      │ checks           │
             │         ┌────▼──────┴──────────────────▼──┐
             │         │  Module 3: AP Queue        ○    │
             │         │  - Mint requests (lock cash)    │
             │         │  - Redeem requests (lock token) │
             └─────────┤  - Request lifecycle            │
                       └─────────────────────────────────┘
```

**Module 1: Minimal token (CIP-56).** A Daml token implementing CIP-56 so it works with
existing Canton wallets, registries, and DvP workflows. Transfer, balances, and
sub-transaction privacy; no mint/burn logic and no asset-specific code. Asset parameters
live in configuration contracts, which is why a single-metal token and a multi-asset
basket use the same template.

It implements the standard on **both V1 and V2**, as Amulet itself does. V2 — the account
model — is the version the contracts are written against; V1 is a downcast of the same
view whose choices route into the same bodies, so there is no second implementation to
drift. V1 is not optional in practice: the token standard CLI's `list-holdings` and
`transfer` both filter on the V1 holding interface, and the featured-app proxies that
attribute activity to an app provider are written against V1 throughout. A V2-only
instrument is invisible to all of it. Accounts are *basic* accounts — owner, no provider,
no id — because a V1 caller has no way to name an account provider, so a holding whose
account carries one can never be matched as a transfer input by a V1 wallet. These are
exactly the conformance details a specification does not catch and a deployment does.

**Module 2: Mint/redeem controller.** All supply changes go through a batch contract
requiring multi-party authorization, using Daml's own authorization rules rather than an
application-level multisig.

- **Dual control (built).** The attestor signs what is held; the issuer approves the NAV
  and never moves reserves; the reserve holder executes and never without an approval.
  Both negative cases are refused by the ledger on a live network.
- **Attestation-capped minting (built, to be hardened).** A mint fails unless post-mint
  supply is covered by a current attestation whose asset class is eligible. The cap is
  currently checked against a supply figure the issuer declares; `InstrumentSupply` makes
  it a ledger invariant. See §2 — we would rather state this plainly than describe the
  guard as stronger than it is.
- **Batch window (net-new).** Requests accumulate over a configurable window (default
  24h). At close, a batch lists pending requests, locked collateral, and the resulting
  supply change.
- **NAV tolerance (net-new).** Collateral is valued at the NAV observed at finalization.
  Requests carry a maximum deviation from the NAV at submission; requests outside
  tolerance are rejected and collateral returned.
- **Safe default.** If data is stale, anomalous, or disputed, signers do not sign and
  nothing settles. There is no admin mint and no bypass of the queue.
- **Signer governance (net-new).** Adding, removing, or rotating signers and changing the
  threshold is itself a multi-party action by the current signer set, recorded on-ledger.
- **Audit log.** Each finalized batch records requests, collateral references, attestation
  and NAV references, authorizations, and the supply change, visible to designated
  observers (auditors, trustees).

**Module 3: Authorized Participant queue (net-new).** Registered APs submit mint and
redeem requests. Settlement in USDCx at launch; any CIP-56 settlement asset (e.g. JPMD
once available on Canton) can be added by configuration without a contract upgrade. On
mint, the AP locks cash and the batch atomically checks NAV and attestation, transfers
collateral to the issuer, and mints to the AP. On redeem, the AP locks tokens and the
batch atomically burns them and pays from an issuer-funded redemption account; physical
delivery is coordinated off-chain with custodians and the on-chain burn reflects completed
delivery. Lifecycle states — pending, settled, rejected with collateral returned, expired
with collateral returned — are all on-ledger.

**Module 4: NAV and reserve attestation.**

- **Reserve attestation (built).** Attested quantity, asset class, custody reference,
  as-of time, attestor signature. The asset class distinguishes allocated metal from
  pending procurement, and a mint only executes against the eligible class. Freshness is
  enforced per batch.
- **Attestation interface (net-new).** Provider-agnostic, so the same interface accepts
  attestations from an oracle network and from an independent assurance firm, and an
  issuer can require both. Multi-attestor consensus for issuers that want no single
  attestor to be dispositive — the decentralized attestor pool pattern RFP-11 names,
  applied to physical custody.
- **Oracle interface (net-new).** Provider-agnostic data shape. The intended reference
  integration is **RedStone CAPS**: our NAV consumes a CAPS root capsule as the canonical
  fixing rather than inventing a price feed. See "Relationship to adjacent work".
- **Public aggregates (net-new, RFP-11).** Total attested reserves, token supply,
  collateralization ratio, per-asset breakdown, and last attestation time, published as a
  Daml contract at broad visibility — **with no holder positions.** This is the first and
  simplest of the three approaches RFP-11 names: *"standardized tooling for asset issuers
  … to publish public aggregates of activity and value."* The aggregate is credible
  because the quantity in it is signed by an attestor who is not the issuer and does not
  benefit from overstating it.

  The published root carries a reference to the attestations it was computed from, so a
  verifier can trace an aggregate back to signed sources without seeing holder detail.
  This follows the capsule lineage pattern RedStone CAPS establishes — public root,
  strictly narrower derived views, verifiable chain back to the root — rather than
  inventing a second way to do the same thing.

**Module 5: Management interfaces.** The **operator view is built and deployed**: a
read-only page over the live ledger showing attested reserves, supply summed from live
holdings, and the `supplyBefore` each pending mint declares, side by side — because that
is the comparison the ledger does not currently make. It exercises no choice and holds no
key that can move an asset. It reads as the admin party, so it sees holder positions and
is access-controlled accordingly. Net-new: an AP view, and the **public** view over the
Module 4 aggregates, which shows reserves and coverage and deliberately shows no holder
table. All rules are enforced in the contracts; the interfaces hold no business logic.

### 4. Architectural Alignment

- **RFP-12.2 — Daml and Institutional RWA Workflow Standards.** Delivers reusable Daml
  models and reference implementations for token and asset representation, asset metadata,
  issuance, transfer, redemption and cancellation workflows, and conformance tests. The
  requirement that proposals "support multiple issuers and applications rather than a
  single proprietary implementation" is met by construction and already demonstrated: one
  package, one factory, two instruments of different shapes, nothing per-instrument on the
  ledger.
- **RFP-11 — Public verifiability.** Publishes reserve and supply aggregates the market can
  rely on without breaking holder privacy, with the attestor separated from the issuer so
  the aggregate is not merely the issuer's own claim.
- **CIP-56 / CIP-112.** Tokens and settlement assets use the Canton token standard on both
  V1 and V2, so they work with existing wallets, registries, and venues.
- **Privacy.** Holder positions are visible to holder and issuer; AP flows are private
  between AP and issuer; batches are visible to signers and auditors; only aggregates are
  public.
- **Atomic composition.** Collateral transfer, NAV check, attestation check, and mint
  execute in one Daml transaction. A venue can reference the current attestation contract
  in the same transaction in which it accepts the token.

### 5. Relationship to adjacent Dev Fund work

This proposal is a consumer and conformance implementation of work the Fund has already
backed, not a competitor to it. Stated explicitly so reviewers do not have to infer it.

| Funded work | Relationship |
|---|---|
| **DA — Token Standard V2** (12,000,000 CC) | We **implement** it, on both V1 and V2, and are among the first non-Amulet instruments to do so on a live network. Allocations here means implementing `splice-api-token-allocation-*-v2` against DA's interfaces. We do not design allocation semantics; that is their grant and their specification. |
| **OpenZeppelin — Canton Ecosystem Stack** (28,378,378 CC) | Complementary. Their four reference implementations are DEX, lending, stablecoin orchestration and auction launchpad; none covers custody-backed issuance. Where they ship audited importable CIP-56 primitives we intend to adopt them rather than maintain parallel code. Their lending RI explicitly contemplates vaults that are "multiply attested" — reserve-backed commodity tokens are collateral that pattern needs. |
| **RedStone — CAPS** (15,775,000 CC) | CAPS is price fixing, not proof-of-reserves, so there is no overlap. Our NAV consumes a CAPS root capsule as the canonical fixing, making this the first RWA issuance path on Canton built on CAPS rather than a bespoke feed. Our public aggregate follows the same public-root/narrower-derived lineage pattern. |
| **Kaiko — Data Standard** (900,000 CC, approved) | Our oracle interface is provider-agnostic by design, so a Kaiko-standard feed is consumable without contract changes. Reference-rate data and reserve attestation are different inputs to the same NAV. |
| **Hacken — Extractor Canton Monitor** ($125,000) | Hacken ships a *Proof of Reserves Monitor* which their own proposal marks as "conceptually valid if PoR attestations are pulled into a Canton smart contract." This proposal is what makes that conditional true. A funded Canton security product is waiting on on-ledger PoR attestations existing. |

### 6. Backward Compatibility

*No backward compatibility impact.* All deliverables are new Daml packages and tooling; no
existing contracts or protocols change. Within our own packages, upgrades follow Daml's
upgrade rules — a package id is the hash of the compiled code, so every change carries a
new version and an explicit `upgrades:` declaration that turns on the compiler's
compatibility check. Once real holdings exist they are upgraded in place rather than
reissued, which is why this discipline is in scope rather than assumed.

---

## Ownership and maintenance after the grant

The Fund asks who operates and maintains the software once the grant ends. Three answers,
in descending order of how much weight they should be given.

**1. We run on it.** Hawkrel issues its own instruments with these contracts and operates
the validators they run on. If the contracts rot, our own product stops working. This is
the only maintenance commitment that does not depend on goodwill, and it is the reason to
prefer an issuer-built standard over a contractor-built one.

**2. Named maintainer and a public contribution path.** Christoph Richter is the named
maintainer for the grant period and 24 months after final acceptance. Apache 2.0, public
repository, issue templates, a contribution guide, and a documented security contact with
a private disclosure path. Triage commitment: 5 working days for a correctness or security
issue, 15 for everything else, stated in the repository so it can be held against us.

**3. Upstreaming the generic half.** The reserve attestation interface, the public
aggregate shape, and the conformance tests are the parts other issuers need and we do not
need to own. We will propose them for Splice or as a CIP, following the route Kaiko's Data
Standard took, so the ecosystem-wide pieces outlive our interest in them. The
commodity-specific configuration stays in our repository.

**If Hawkrel stops operating**, the Apache 2.0 licence, the public history, and the
documentation are sufficient for a third party to continue — and the acceptance criteria
below require an unrelated issuer to have deployed from the documentation unaided, which
is the only real test of that claim.

---

## Direction after this grant — stated, and deliberately not funded by it

None of what follows is in the milestones, the acceptance criteria or the cost breakdown.
It is here because the Fund asks what happens to software after a grant ends, and the
honest answer is better evidenced by what we intend to build on top of this than by a
maintenance promise. Each item below is a reason the contracts will still be maintained in
two years: we will be depending on them.

**OTC settlement directly on the issuer's node.** Today a bilateral trade in a
reserve-backed token either goes through a venue or settles off-ledger and is reported
back. Neither is satisfactory: the first adds a counterparty and a listing requirement to
a trade two parties have already agreed, and the second gives up atomicity, which is the
one thing a ledger was supposed to provide. The intent is a negotiated, bilateral,
delivery-versus-payment path that runs on the issuer's own validator — a quote, an
acceptance, and a single transaction in which the metal token and the settlement asset
change hands or neither does, visible to the two counterparties and the registry and to
nobody else.

The allocation work in the build track above is **necessary but not sufficient** for this,
and both halves of that are worth stating plainly.

What allocations give is the settlement leg: `splice-api-token-allocation-*-v2` exists
precisely so a holding can be committed to a settlement that executes atomically, and the
redemption path is already written to settle against an allocation once they are
implemented. The same machinery that settles an AP redemption against USDCx settles an OTC
trade against it.

What they do not give is the negotiation. Nothing in the package expresses a quote and an
acceptance, and that is net-new templates rather than configuration — closest in shape to
the request / approve / expire lifecycle `RedeemRequest` already has.

And one dependency is not ours to satisfy: atomic delivery-versus-payment requires the
**settlement asset's own registry** to implement allocations too. We cannot make USDCx
allocatable by building anything on our side. So the honest statement of this direction is
that our half becomes ready and the path opens when the counterparty registry's does — the
same shape as the Hacken row in §5, where a funded security product is waiting on
on-ledger attestations existing. We raise it here rather than folding it into the ask
because the grant should fund the standard-conformant primitive, not our use of it.

**Position netting across a settlement period.** An issuer that settles many bilateral
trades a day is interested in the net change in each counterparty's position, not in the
gross count of transfers — for settlement efficiency, and because a net figure is the
honest denominator for several things a gross figure flatters. The accounting for this
already exists in the economic-event derivation above; what does not exist is netting it
per participant per period and settling on the net.

Which netting is the right one is a genuine open question rather than merely unbuilt work,
and it is decided by the shape of the book rather than by preference. Netting globally per
participant collapses a legitimate dealer chain — A to B to C, with B a market maker, nets
to a single flow and the dealer's leg disappears. Netting pairwise keeps that leg but
misses a circular A to B to C to A. The first direction above, OTC settling directly
between two counterparties on the issuer's node, **is** the bilateral case, which argues
for pairwise netting; naming both in the same section is therefore a choice and not a
coincidence.

**Intraday settlement.** Settlement moves off a daily NAV onto an intraday cadence; the
decision is taken rather than aspirational, and the corresponding amendments to the
whitepaper and terms are in train. It lands directly on the contracts described above
rather than beside them: the time machinery today is the attestation freshness window on
the mint path and the execution deadline on the redemption path, and intraday settlement is
those cadences tightening plus a NAV fixing per window rather than per day. It is named
here because a reviewer assessing whether this code survives contact with the business
should know the one change to the business that is already decided.

**Delivery-versus-payment venue listing.** The same allocation machinery as the OTC case,
at its third use, and the more concrete of the two: a listing is a counterparty
conversation rather than a capability. It carries the same dependency — the settlement
asset's registry has to implement allocations as well.

**Reserve-backed instruments as collateral.** OpenZeppelin's funded lending reference
implementation explicitly contemplates vaults that are "multiply attested." A commodity
token whose supply cap is a ledger invariant and whose reserves carry an independent
attestor is the collateral that pattern is describing. Making that work needs no new
contracts from us, only the public on-ledger aggregate this grant funds, which is what a
lending protocol would read to price a haircut.

**Further single-metal instruments.** The asset-agnosticism claim in §2 is demonstrated
with two instruments today. Each additional metal is a configuration entry, an
attestation, and a mint — no new contracts. Expanding the set is business work, not
protocol work, which is the point of the claim and the reason it is not a milestone here.

---

## Milestones and Deliverables

Funding is split **$205,000 build, $150,000 adoption**. Build milestones unlock on code
and documentation. Adoption milestones unlock only when parties other than Hawkrel actually
use the work. Reviewers should not pay for shelfware.

Adoption is close to parity with build, and that is a consequence of §2 rather than a
preference. The redemption half and the supply-accounting gap were the two largest build
items when this was first filed; both have since been built at our own cost, and they are
not being asked for. What remains on the build side is the multi-issuer work and an audit.
The audit is the one line our own engineering time cannot absorb, and it is now the single
largest item in the request.

```
  BUILD  $205,000 / 2,105,000 CC             ADOPTION  $150,000 / 1,540,000 CC
  ┌──────────┬──────────────┬──────────┐     ┌──────────┬──────────┬──────────┐
  │ B1 spec  │ B2 implement │ B3 audit │     │ A1 third │ A2 venue │ A3 sus-  │
  │ + review │ + TestNet    │ + MainNet│     │ party    │ listing  │ tained   │
  │ 3 wks    │ 10 wks       │ 6 wks    │     │ deploy   │          │ usage    │
  │ $30K     │ $110K        │ $65K     │     │ $45K     │ $55K     │ $50K     │
  │ 308K CC  │ 1,130K CC    │ 667K CC  │     │ 462K CC  │ 565K CC  │ 513K CC  │
  └──────────┴──────────────┴──────────┘     └──────────┴──────────┴──────────┘
  Wk 1     3  Wk 4       13  Wk 14    19     after B2    after B3   B3 + 8 wks
```

Target start on approval; build track completes ~19 weeks later. Adoption milestones have
no fixed date: they are claimed when the evidence exists, and expire 12 months after B3
acceptance if it does not.

### Build track — $205,000 / 2,105,000 CC

**B1 — Specification and ecosystem review (3 weeks, $30,000 / 308,000 CC)**

- Public specification for all six modules, the settlement asset interface, the oracle
  interface, and the reserve attestation interface, written against the contracts as
  deployed rather than as intended.
- Specification reviewed with the Token Standards / Asset Standards SIG and the
  Decentralized Attestor Pools SIG, and with at least two Canton venues or issuers;
  feedback documented in the repository.

**B2 — Multi-issuer implementation and TestNet (10 weeks after B1, $110,000 / 1,130,000 CC)**

- N-of-M signer sets with on-ledger signer rotation, and configurable approval policy,
  replacing the fixed issuer/reserve-holder pair the contracts enforce today.
- Provider-agnostic attestation interface and multi-attestor consensus, so an issuer can
  name several attestors and an assurance firm alongside an oracle feed.
- Allocations implemented against DA's `splice-api-token-allocation-*-v2` interfaces, with
  the existing redemption path switched to settle against an allocation.
- Public aggregates contract live on TestNet **on-ledger at broad visibility**, with the
  holder table demonstrably absent.
- Reference integration against a RedStone CAPS root capsule for NAV.
- Both reference shapes — a single-metal token and the basket — completing full mint and
  redeem cycles against USDCx on TestNet.
- Test suite extended to signer rotation, multi-attestor disagreement, allocation-settled
  redemption, and aggregate correctness, each mutation-tested to the same standard as the
  existing guards.
- Developer documentation sufficient for a third-party issuer to deploy a new instrument
  without our assistance.

**B3 — Audit and MainNet (6 weeks after B2, $65,000 / 667,000 CC)**

- Independent security audit of the Daml contracts; findings and fixes published, no
  unresolved critical or high findings.
- MainNet deployment of the reference instruments, connected to custody providers,
  price feeds, and reserve attestation.
- Public reserve and collateralization view live on MainNet data.
- Contribution guide, issue templates, security contact, and the maintenance commitments
  above published in the repository.

### Adoption track — $150,000 / 1,540,000 CC

Each adoption milestone can be evidenced in **any one of three ways**, so it can be met
without publishing holder positions or confidential custody terms:

- **(a)** verifiable MainNet transaction hashes or public repository evidence; **or**
- **(b)** a formal **Letter of Dependency** submitted privately to the Foundation
  committee by the adopting party; **or**
- **(c)** a joint public announcement by the adopting party.

**A1 — Independent third-party deployment ($45,000 / 462,000 CC).** An issuer with no commercial
relationship to Hawkrel or ARU deploys a new instrument from the public documentation,
unaided, on TestNet or MainNet. Evidence must come from an entity independent of Hawkrel.
This is the milestone that proves the Public Good claim; it is deliberately the one we
cannot satisfy ourselves.

**A2 — Venue listing or integration ($55,000 / 565,000 CC).** At least one Canton venue lists or
integrates an instrument issued with these contracts, with the attestation checked as part
of its acceptance path rather than trusted out of band.

**A3 — Sustained usage ($50,000 / 513,000 CC).** Twelve consecutive weeks in which at least two
distinct issuers or venues are transacting, with a minimum of 200 settled batch or
transfer events and a continuously maintained attestation and published aggregate across
the period — i.e. the infrastructure is in service, not demonstrated once.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on:

- Specification reviewed with both named SIGs and at least two ecosystem participants,
  with feedback addressed and documented (B1).
- Supply governed by **N-of-M signers with on-ledger rotation**, and reserves attested by
  **more than one attestor**, with disagreement refused rather than resolved in the
  issuer's favour (B2). *The ledger invariant capping supply against attested reserves is
  already in force and is not a criterion for this grant — see §2.*
- Both reference shapes complete mint and redeem cycles on TestNet **settling against an
  allocation rather than a direct transfer** (B2), and are live on MainNet (B3).
- Public aggregates readable by any observer **on-ledger at broad visibility**, containing
  reserves, supply and coverage, and verifiably containing no holder-level data (B2, B3).
- An independent issuer deploys a new instrument from the documentation unaided, evidenced
  by a party independent of Hawkrel (A1).
- At least one Canton venue lists or integrates an instrument, with attestation checked in
  its acceptance path (A2).
- Independent audit completed with no unresolved critical or high findings (B3).
- All code public under Apache 2.0, with the maintenance commitments published.

---

## Funding

**Total scope value: $355,000 USD**, fixed at submission so the committee can assess the
scope against a stable reference rather than a moving token price. Every figure below is
denominated in that reference; the CC amounts are derived from it, not the other way round.

**This request is $95,000 smaller than the figure first filed**, because two of its largest
build items were completed at our own cost in the interval and have moved into §2's left
column. The audit line has gone the other way and is larger, for the reason given below.

**Development Fund request: 3,645,000 CC** — $205,000 build, $150,000 adoption. Converted at
$0.0974/CC, the September 2026 rate; «TODO: re-fix this rate on the submission date and
restate the CC figures, which move with it while the USD scope value does not».

**Basis for the figure.** The build track is costed bottom-up from the line items below,
and is consistent with approximately **1.8 FTE of Daml and backend engineering across the
19-week build track**, on the same per-FTE basis RedStone states for CAPS. The engineering
lines total $110,000; the remainder is the audit, infrastructure, and documentation, which
are not engineering FTE.

For calibration against what the Fund has already approved: Kaiko's Data Standard was
approved at 900,000 CC to publish a specification into Splice, with no audit, no MainNet
deployment, and no redemption path to build. Srikanth's settlement-pattern reference
implementations were 1,100,000 CC. At the upper end, DA's Token Standard V2 is 12,000,000 CC
and RedStone's CAPS 15,775,000 CC. This request sits between those bands, nearer the lower
one, which is where a scope that includes a full security audit and a MainNet deployment of
working contracts belongs once the contracts themselves are written.

### Co-investment

The Fund's expectation is that an applicant shares the cost rather than transferring it.
Hawkrel's contribution is not a promise; much of it is already spent:

| Hawkrel co-investment | Form |
|---|---|
| The core contracts, registry service, operator view, test and mutation-test suites | Built before this request, at own cost — see §2 |
| The full redemption and settlement path, and `InstrumentSupply` | Built **after** this request was first filed, at own cost, and withdrawn from the ask rather than invoiced against it — the single largest change in this revision |
| Economic-event derivation, the activity-marker rule and its public evidence page | Built at own cost; the generic half offered upstream — see §2 and "Direction after this grant" |
| Canton DevNet validator (since 2026-07) and TestNet validator (since 2026-09) | Operated at own cost, including for the duration of the grant |
| MainNet validator and the CIP-0116 featured-issuer lock | Hawkrel's own capital and financing; **not requested from the Fund** |
| Custody, assurance, compliance, index methodology, business development | Funded entirely separately |
| Maintenance for 24 months after final acceptance | Committed above |
| **Indicative value of work already delivered** | **«TODO: engineering cost to date, USD»** |

The Fund is asked to fund only the open-source deliverables in the net-new column of §2.
It is not asked to fund ARU's product, its reserves, its validators, or its MainNet
listing economics.

### Volatility stipulation

The build track is under 6 months. Should the timeline extend beyond 6 months because of
Committee-requested scope changes, remaining milestones are renegotiated against the
fixed USD scope value to account for USD/CC volatility. Adoption milestones, which have no
fixed date by design, are denominated against the same fixed USD reference.

### Cost breakdown

Build track, $205,000:

| Item | USD | Share |
|---|---:|---:|
| Independent security audit, findings and fixes published | $70,000 | 34% |
| Daml: allocations against `splice-api-token-allocation-*-v2` | $35,000 | 17% |
| Daml: N-of-M signer governance and on-ledger signer rotation | $25,000 | 12% |
| On-ledger public aggregate at broad visibility (RFP-11) | $25,000 | 12% |
| Oracle and attestation interfaces — CAPS reference integration, multi-attestor consensus | $25,000 | 12% |
| Specification, documentation, conformance tests, SIG and community review | $20,000 | 10% |
| Infrastructure — MainNet and TestNet operation during the grant, CI, monitoring | $5,000 | 2% |
| **Total** | **$205,000** | **100%** |

**The audit is now the largest line, and it is larger than the figure first filed.** That is
deliberate and it is a consequence of §2: the contract surface to be audited has roughly
tripled since this was first scoped, and the single biggest addition is the 539-line
redemption module, which is the code that moves value out of the reserve. Scoping an audit
to the old codebase and then presenting it against the new one would be the cheapest
possible way to make this request look smaller, and it is the one line the co-investment
argument cannot cover: everything else can in principle absorb more of our own engineering
time, and an audit cannot. Hacken's own Dev Fund proposal prices its entire product build
at $125,000, which is the reference point for what a credible Daml engagement costs.

Adoption track, $150,000: not allocated to line items. It is paid against the evidence
described above, after the work is in use by someone other than us.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Joint announcement of open issuance infrastructure for physically backed assets on
  Canton.
- Technical blog post on attestation-capped minting and on publishing a verifiable
  aggregate without disclosing holder positions.
- Developer case study: deploying a new commodity instrument from the repository.
- Demo at a Canton ecosystem call or event, together with the listing venue.

---

## Motivation

**Demonstrated venue demand, on the public record.** Temple Digital Group launched spot
tokenized gold and silver on Canton in July 2026. Commenting on this proposal on
2026-09-01, Temple stated they would *"plan to list tokenized spot commodity assets issued
by ARU"* ([PR #87](https://github.com/canton-foundation/canton-dev-fund/pull/87)). Temple's
requirement is that tokens are minted only against fully allocated metal — which is the
attestation-capped mint, and the reason the asset class on an attestation is enforced
rather than advisory. Other Canton projects have expressed interest in commodity-backed
assets as collateral and liquidity.

**Who benefits, and how it drives adoption.** Any issuer of custody-backed assets on
Canton — metals first, and with the same attestation interface any physically held RWA.
Any venue, lender, or counterparty that must verify backing before accepting such a token,
because the check becomes a contract reference in the same transaction rather than a
bilateral diligence exercise. And a funded Canton security product whose Proof of Reserves
Monitor is contingent on exactly these attestations existing on-ledger.

**Network activity.** Each deployment generates recurring on-ledger activity: batch
settlements, NAV updates, attestations, aggregate publications, and AP flows. Attestation
and aggregate publication are periodic and continue whether or not the instrument trades.

**Collateral diversification.** Commodity tokens that settle atomically against USDCx and
other CIP-56 assets extend Canton's collateral universe beyond financial instruments, and
give the DeFi reference implementations the Fund is backing a non-financial collateral
type to work with.

---

## Rationale

**Why Daml-native, not bridged?** A bridged ERC-20 cannot compose atomically with Canton
settlement assets or reference Canton-side attestations in the same transaction, and does
not inherit Canton's privacy model. ARU's EVM token continues to exist separately; this
builds the Canton-native issuance path.

**Why extend CIP-56 rather than define a new token standard?** The token is plain CIP-56 so
it works with existing wallets and venues, and the standard's own V2 work is DA's grant,
not ours. The new work is the issuance, redemption, and attestation layer around it, which
CIP-56 intentionally does not define.

**Why a batch window with multi-party approval?** Physical assets do not settle instantly,
and oracle or attestation data can be stale or wrong. A multi-party batch gives operators
time to cross-check custody confirmations before supply changes, and makes "do nothing" the
safe default without a separate pause switch or admin key.

**Why separate the attestor from the issuer?** Because RFP-11 is right that an issuer's own
aggregate may not be trusted. The attestor signs what is held and cannot mint; the issuer
approves value and cannot move reserves; the reserve holder executes and cannot execute
unapproved. An aggregate derived from an attestation signed by a party with no incentive to
overstate it is worth more than the same number published by the issuer.

**Why two reference shapes?** A single-metal token and a multi-asset basket exercise
different configuration paths. Building both from the start is what prevents the contracts
being shaped around one issuer — and it is already done, which is why the asset-agnostic
claim is evidence rather than intention.

**Why the supply-accounting gap was disclosed before it was fixed.** An earlier revision
of this document named a real weakness in its own code: the mint guard compared against a
supply figure the issuer asserted rather than one the ledger derived, so an understated
figure would over-mint and the ledger would not object. It was disclosed because a reviewer
who finds a flaw like that in the code after approval has reason to doubt everything else
in the document. `InstrumentSupply` has since closed it, and the line item that would have
funded the fix has been removed from the request. The disclosure is left standing here
rather than quietly deleted, because the reason for making it does not expire once the bug
is fixed, and because the same standard governs what is still open: §2's right-hand column
is written to be checked the same way.

**Alternatives considered:**

- *Specification only:* rejected; venues need deployable, audited code, and a specification
  would not have surfaced the V1/V2 conformance details or the supply gap.
- *Gold-only token:* rejected; spot gold already trades on Canton, and demand is for
  additional metals and baskets.
- *Automated real-time minting:* rejected; creates a gap between issuance and physical
  allocation.
- *Admin-key issuer model:* rejected; single-key minting is the main failure mode for
  reserve-backed tokens.
- *Waiting for OpenZeppelin's contracts library:* rejected as a blocker, adopted as a
  dependency. Their library will improve the token layer; none of it addresses custody
  attestation, which is the half nobody else is building.
