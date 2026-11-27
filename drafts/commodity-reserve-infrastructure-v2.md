> **INTERNAL DRAFT v4, revised 2026-11-23 — do not submit. Remove this box before sending
> to Canton.**
>
> **Changes in v4 (2026-11-23).** Entity naming corrected throughout: Lanthic is the issuer
> party, Hawkrel the grant recipient and IP holder, the Foundation the reserve holder.
> Then cut for length. Measured against the 58 merged proposals on `upstream/main`: their
> median is 3,270 words and DA's Token Standard V2, a 12,000,000 CC ask, is 2,766. This
> document was 8,046 words of submitted body, longer than 55 of the 58. It is now ~6,230,
> of which **4,845 is prose** and the rest is table and diagram. Nothing factual was
> dropped: every §2 row, every figure and every cited source survives. What went was
> restatement — the Direction section (891 to 460), §3's module prose, §5's survey of
> adjacent grants, and the framing sentences around the §2 table. Figures still reconcile:
> 205 + 150 = 355; 2,105 + 1,540 = 3,645; the cost lines sum to 205.
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
> - [x] **ENTITY — answered by Chris on 2026-11-23. Lanthic issues both ARU and the
>   single-metal instruments; Hawkrel receives the grant and holds the IP.** The document is
>   updated accordingly: Hawkrel is named as grant recipient and index/IP holder, Lanthic as
>   the issuer party, the Foundation as reserve holder. "We run on it" no longer claims
>   Hawkrel issues anything, and now makes a better argument than it did — the
>   issuer/reserveHolder split is visible on the ledger rather than only in a corporate
>   chart, and Hawkrel taking no operating role is the point rather than an omission.
>
>   **Two things this leaves open, neither of them drafting:**
>
>   - **`brain/entity-roles.md` is now stale and is the canonical file.** It says "Issue /
>     redeem ARU | Vantara" (:85), "Approve mint/redeem NAV and price | Vantara multisig"
>     (:96), and marks Lanthic *"proposed, not adopted"* (:33). All three are superseded by
>     Chris's answer. It was last touched 2026-08-03. Until it is updated, the canonical
>     reference and this proposal disagree, and the canonical reference is the one other
>     sessions read. **This should be fixed before anything else cites it.**
>   - **Vantara's remaining role is undefined here.** entity-roles.md gives Vantara
>     procurement, redemption administration, the management fee and incentive funding. If
>     Lanthic now issues, whether Vantara keeps those is a question this document does not
>     need answered to be submitted, but entity-roles.md does.
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

**Organization:** Hawkrel Inc. (BVI) — grant recipient, index methodology and IP
**Issuer party:** Lanthic — issues and redeems ARU and the single-metal instruments
**Reserve holder:** Acua Reserve Foundation (Panama) — legal title, named client on custody
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

Canton settles tokenized treasuries, bonds, money market funds and deposit tokens, and spot
tokenized gold and silver now trade on Canton venues. What is missing is an open, reusable
way to **issue and redeem** tokens backed by physically custodied assets, with supply
provably capped by independently attested reserves.

**This is not a theoretical proposal.** The core contracts are written, tested and
deployed. They run on a Canton DevNet validator (since 2026-07) and a TestNet validator
(since 2026-09). A dual-control mint has executed. Holdings have been read back through
both the V1 and V2 token standard interfaces, and transfers instructed and accepted over
each. The ledger refused the negative cases — a reserve holder executing an unapproved
mint, a sender accepting her own transfer — with the assertion text from the contracts.
All of it was built at Hawkrel's cost before any grant.

**The contracts are asset-agnostic, and that is demonstrated rather than asserted.** On
2026-10-05 a second instrument was issued on TestNet alongside the basket: **ARU-CU**, a
single-metal copper token of the shape a venue listing asks for, issued under the Lanthic
brand. One Daml package, one transfer factory, two instruments, distinguished only by the
attestations they are minted against. Nothing per-instrument exists on the ledger. A third
issuer adds a configuration entry, an attestation and a mint — no new contracts, no fork,
no assistance from us. **ARU** itself is a diversified basket of physical metals across
three sleeves, set by a published rules-based index methodology. Neither shape is
privileged in the contracts, which is the point: a basket is a configuration, not a
different token.

**The full issue-and-redeem lifecycle is closed, and the supply cap is a ledger
invariant.** Both were built after this proposal was first filed, at our own cost, and both
have been withdrawn from the request rather than invoiced against it.

What this grant funds is the distance between a working single-issuer system and
infrastructure anyone else can use: multi-party signer governance in place of our fixed
pair, a provider-agnostic attestation interface with multiple attestors, allocations
against DA's V2 interfaces, the public verifiability layer published on-ledger rather than
served from our host, an independent security audit, and documentation sufficient for an
unrelated issuer to deploy without us.

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

The grant funds the second column only. This section is specific because "already working"
is a claim a reviewer should be able to check.

What exists is **1,259 lines of Daml across six modules and eleven templates**, with
**1,958 lines of Daml tests**. The asset-backing half — issuance, attestation, redemption —
is 729 of those lines.

**The full issue-and-redeem lifecycle is closed.** A venue cannot list a token nobody can
redeem, so that half was built at our own cost after this proposal was first filed. The
consequence for this request is direct: **the two items this proposal previously called its
largest — the redemption half and the supply-accounting gap — are no longer being asked
for.** They are in the left column, and the request below is smaller than the one
originally filed because of it.

**What is still missing is, disproportionately, the part that serves issuers other than
us.** A single issuer with one attestor and one reserve holder needs no N-of-M signer sets,
no rotation, no multi-attestor consensus, no provider-agnostic interface, no conformance
tests a stranger can run, and no documentation that works without us in the room. The
single-issuer version is the cheap one, and it is the one already done. The multi-issuer
version is the grant.

| Component | Status today | Net-new under this grant |
|---|---|---|
| **Minimal CIP-56 token** — holdings, transfers, sub-transaction privacy | **Built.** On **both V1 and V2**, as Amulet does. Deployed on DevNet and TestNet. | Upgrade-compatibility discipline across versions; conformance suite published as a reusable artifact |
| **Dual-control mint** — attestor signs what is held, issuer approves NAV, reserve holder executes | **Built.** Enforced by the ledger, both negative cases refused on a live network. | N-of-M signer sets and on-ledger rotation; batch windows (`MintBatch` mints one amount to one recipient today — the name is not an aggregation); an **issuer-side NAV deviation band**, since `minProceeds` is only the redeemer's half of one and `navApproved` is a bare Bool |
| **Reserve attestation** — quantity, asset class, as-of time, freshness window | **Built.** `AllocatedMetal` vs. pending procurement; a mint fails outside the freshness window. | Provider-agnostic attestation interface; multi-attestor consensus; assurance-firm attestations alongside oracle feeds |
| **On-ledger supply accounting** | **Built — and it was the gap this proposal named as its most important deliverable.** `InstrumentSupply` is consumed and recreated by every mint and every burn, so a mint declaring an understated prior supply is refused by the ledger, not by our tooling. | — |
| **Redemption and settlement** | **Built.** AP roster with revocation either side can exercise alone; the redeemer sets its own proceeds floor and deadline; issuer prices, reserve holder settles, neither alone; burn-on-redeem recreating supply in the same transaction; rejection, withdrawal and expiry all return the locked holding. Proceeds record the supply figure they were priced against, and execution is refused if supply has moved since. Settlement asset is configuration, not code. 904 lines of tests. | Allocations implemented against DA's V2 interfaces, so settlement executes against an allocation rather than a direct transfer |
| **Transfer factory and instructions** — two-step, either side able to end it | **Built.** Admin-scoped, so one factory serves every instrument. | — |
| **Registry service** — metadata, supply, and the disclosed contracts a wallet needs | **Built.** Read-only, holds no key that can move an asset. Validated against the standard's OpenAPI documents. | Public aggregate endpoints; registry conformance published as a reusable check |
| **Operator view** | **Built.** Deployed, access-controlled, read-only. | — |
| **Economic-event derivation and marker claiming** | **Built, and public.** A holdings change carrying a transfer leg is an economic event; locks, instructions and returns are not; movements with an ARU-controlled party on both ends are excluded. One file, no network, clock or filesystem access, 42 tests, reproducible by a third party from public ledger data without our cooperation. Published at `apcanton.arureserve.com/markers`. | **Two claims, which should not be merged.** The *derivation* depends on nothing but Token Standard V2 event shapes, so any CIP-56 issuer inherits it unchanged — that half we propose upstream. The *weight table* is calibrated per instrument against a physical unit and does not port: its top threshold is 100,000 tokens, about 100 tonnes of copper here and $100,000 on a stablecoin. That calibration is the design, not a limitation: a kilogram band is bounded by a warehouse attestation, a third party's statement, where a value band would be bounded only by a price we publish |
| **Token Standard V2 event log** | **Built.** `Events.daml`. Without it a generic V2 wallet can read a holding it already knows about but cannot learn one appeared, moved or went away. Our pre-deployment review found it implemented but **not advertised**, so no V2 wallet would have followed an ARU balance — caught before deployment. | — |
| **Live-ledger acceptance suite** | **Built.** `verify.mjs`, 945 lines, run against the deployed package on a real network rather than in Daml Script — including the case where the issuer signs its own attestation for a million, names itself attestor, approves the NAV, and the ledger refuses the mint. A Daml Script suite cannot establish that, because it cannot be wrong about which code is deployed. | Published as a conformance suite a third-party issuer can run against their own deployment |
| **Public verifiability (RFP-11), on-ledger** | **Partly.** Reserves, supply and coverage are published today, but as a served view rather than a contract. `InstrumentSupply` carries no observer — it is visible to issuer and reserve holder alone — so the aggregate a third party reads is our server's statement, not the ledger's. **No on-ledger aggregate exists at broad visibility.** | Attested reserves, supply, collateralization, per-asset breakdown and last-attestation time, published **on-ledger** at broad visibility, with **no holder positions** |
| **Independent security audit** | **Not done,** and the surface has roughly tripled since this was first scoped. | Full audit of the Daml contracts, findings and fixes published |
| **MainNet** | **Never deployed.** | MainNet deployment of both reference instruments against live custody, price feeds and attestation |
| **Third-party deployability** | **Not proven.** | Documentation sufficient for an unrelated issuer to deploy unaided, with that deployment as an acceptance criterion |

Every guard above is **mutation-tested**: each is deleted on its own in a throwaway copy,
and the test that should catch it is required to fail while nothing else does. This exists
because early on every negative test passed while the happy path was broken. A validator
that cannot fail is decoration.

### 3. Implementation Mechanics

Keep the token contract minimal. Move complexity into surrounding modules. Require
multi-party approval for every supply change.

```
                   ● built   ◐ partly built   ○ net-new

    ┌─────────────────────────────────────────────────────────────┐
    │   Module 5: Interfaces   ● operator  ○ AP  ○ public view    │
    └────────┬──────────────────┬──────────────────┬──────────────┘
    ┌────────▼────────┐  ┌──────▼─────────┐  ┌─────▼──────────────┐
    │ 1: Token        │  │ 2: Mint/Redeem │  │ 4: NAV + Reserve   │
    │   (CIP-56 V1+V2)│  │    Controller  │  │    Attestation     │
    │ ● transfer      │  │ ● dual control │  │ ● attestation      │
    │ ● balance       │  │ ● supply cap,  │  │ ● asset class      │
    │ ● privacy       │  │   as a ledger  │  │ ● freshness        │
    │ ● V2 event log  │  │   invariant    │  │ ○ oracle iface     │
    │ ○ allocations   │  │ ● redeem/burn  │  │ ○ multi-attestor   │
    │                 │  │ ○ N-of-M sigs  │  │ ○ public aggregate │
    │                 │  │ ○ batch window │  │                    │
    └────────▲────────┘  └──┬──────▲──────┘  └────────┬───────────┘
             │  mint/burn   │      │ reserve + NAV    │
             │         ┌────▼──────┴──────────────────▼──┐
             └─────────┤ 3: AP queue — requests, lock,  ●│
                       │    lifecycle, settlement        │
                       └─────────────────────────────────┘
```

**Module 1 — CIP-56 token (built).** Transfer, balances, sub-transaction privacy. No
asset-specific code, so a single-metal token and a basket use the same template.

It implements the standard on **both V1 and V2**, as Amulet does. V2 is what the contracts
are written against. V1 is a downcast of the same view, routing into the same bodies, so
there is no second implementation to drift. V1 is not optional. The token standard CLI's
`list-holdings` and `transfer` both filter on the V1 holding interface, and the featured-app
proxies are written against V1 throughout. A V2-only instrument is invisible to all of it.
Accounts are *basic* accounts: a V1 caller cannot name an account provider, so a holding
whose account carries one can never be matched as a transfer input. These are the
conformance details a specification does not catch and a deployment does. `Events.daml`
emits the V2 holdings-change events that let a generic wallet follow a balance at all.

*Net-new: allocations, against DA's V2 interfaces.*

**Module 2 — mint and redeem controller (built).** Every supply change goes through a batch
contract requiring multi-party authorization, using Daml's own authorization rules rather
than an application-level multisig.

The attestor signs what is held. The issuer approves the NAV and never moves reserves. The
reserve holder executes, and never without an approval. Both negative cases are refused by
the ledger on a live network.

A mint fails unless post-mint supply is covered by a current attestation of an eligible
asset class. That cap is a **ledger invariant**: `InstrumentSupply` is consumed and
recreated by every mint and every burn, so an understated declaration is refused by the
contracts rather than by our tooling. Redemption burns and recreates supply in the same
transaction. Proceeds record the supply figure they were priced against, and execution is
refused if supply has moved since.

If data is stale, anomalous or disputed, signers do not sign and nothing settles. There is
no admin mint and no bypass of the queue.

*Net-new: N-of-M signer sets with on-ledger rotation; batch accumulation windows; an
issuer-side NAV deviation band, since `minProceeds` is only the redeemer's half of one.*

**Module 3 — Authorized Participant queue (built).** Registered APs submit redemption
requests. The AP sets its own floor on proceeds and its own deadline. The amount is locked
rather than taken, so a stalled request returns to the AP instead of needing recovery.
Lifecycle states — pending, priced, settled, rejected, withdrawn, expired — are all
on-ledger. The settlement asset is configuration, not code: USDCx at launch, any CIP-56
settlement asset later without a contract upgrade.

**Module 4 — NAV and reserve attestation (built; the interfaces are not).** An attestation
carries quantity, asset class, custody reference, as-of time and attestor signature.
Allocated metal is distinguished from pending procurement, and a mint executes only against
the eligible class. Freshness is enforced per batch.

*Net-new, and where most of the grant goes:*

- **Attestation interface.** Provider-agnostic, so the same shape accepts an oracle network
  and an independent assurance firm. An issuer can require both.
- **Multi-attestor consensus.** The decentralized attestor pool pattern RFP-11 names,
  applied to physical custody.
- **Oracle interface.** Provider-agnostic. The reference integration is a **RedStone CAPS**
  root capsule, rather than a price feed we invent.
- **Public aggregate.** Reserves, supply, collateralization, per-asset breakdown and last
  attestation time, published as a Daml contract at broad visibility — **with no holder
  positions.** It is credible because the quantity in it is signed by an attestor who is not
  the issuer and does not benefit from overstating it. It carries a reference back to the
  attestations it was computed from, following the lineage pattern CAPS establishes.

**Module 5 — interfaces (operator view built).** A read-only page over the live ledger. It
exercises no choice and holds no key that can move an asset. *Net-new: an AP view, and the
public view over the Module 4 aggregate, which shows coverage and deliberately shows no
holder table.* All rules live in the contracts; the interfaces hold no business logic.

### 4. Architectural Alignment

- **RFP-12.2 — RWA workflow standards.** Reusable Daml models for issuance, transfer,
  redemption and cancellation, with conformance tests. The requirement that proposals
  "support multiple issuers and applications rather than a single proprietary
  implementation" is already demonstrated: one package, one factory, two instruments of
  different shapes, nothing per-instrument on the ledger.
- **RFP-11 — Public verifiability.** Reserve and supply aggregates the market can rely on
  without breaking holder privacy. The attestor is separate from the issuer, so the
  aggregate is not merely the issuer's own claim.
- **CIP-56 / CIP-112.** Both V1 and V2, so the instruments work with existing wallets,
  registries and venues.
- **Privacy and atomicity.** Holder positions are visible to holder and issuer, AP flows to
  AP and issuer, batches to signers and auditors. Only aggregates are public. Collateral
  transfer, NAV check, attestation check and mint execute in one Daml transaction, so a
  venue can reference the current attestation in the same transaction in which it accepts
  the token.

### 5. Relationship to adjacent Dev Fund work

This consumes work the Fund has already backed. It does not compete with it.

- **Token Standard V2** (DA, 12,000,000 CC) — we implement it, on both versions.
  Allocations here means implementing their interfaces, not designing allocation semantics.
- **Ecosystem Stack** (OpenZeppelin, 28,378,378 CC) — DEX, lending, stablecoin
  orchestration, launchpad. None of them custody-backed issuance. Where they ship audited
  CIP-56 primitives we intend to adopt them rather than maintain parallel code. Their
  lending RI contemplates "multiply attested" vaults, which is what a reserve-backed
  commodity token is.
- **CAPS** (RedStone, 15,775,000 CC) — price fixing, not proof-of-reserves. No overlap. Our
  NAV consumes a CAPS root capsule as the canonical fixing.
- **Data Standard** (Kaiko, 900,000 CC) — consumable through the same oracle interface.
- **Extractor Canton Monitor** (Hacken, $125,000) — ships a Proof of Reserves Monitor their
  own proposal marks as "conceptually valid if PoR attestations are pulled into a Canton
  smart contract". A funded Canton security product waiting on exactly what this builds.

### 6. Backward Compatibility

*No impact.* All deliverables are new Daml packages and tooling. No existing contracts or
protocols change.

Within our own packages, upgrades follow Daml's rules. A package id is the hash of the
compiled code, so every change carries a new version and an explicit `upgrades:`
declaration that turns on the compiler's compatibility check. Once real holdings exist they
are upgraded in place rather than reissued, which is why that discipline is in scope rather
than assumed.

---

## Ownership and maintenance after the grant

The Fund asks who maintains the software once the grant ends. Three answers, in descending
order of weight.

**1. We run on it.** These contracts are not a reference implementation written beside a
product; they are the product. Lanthic issues and redeems against them, the Foundation
holds title to the reserve they cap, and the validators are ours. If the contracts rot, our
own issuance stops working. This is the only maintenance commitment that does not depend on
goodwill.

The separation is visible on the ledger, not only in a corporate chart. `MintBatch` and
`InstrumentSupply` are parameterised on `issuer` and `reserveHolder`, two different parties
by construction: the entity that prices an issuance cannot be the entity that settles it.
Hawkrel, which receives this grant and holds the methodology and the IP, is neither, and
takes no operating role.

**2. Named maintainer and a public contribution path.** Christoph Richter is the named
maintainer for the grant period and 24 months after final acceptance. Apache 2.0, public
repository, issue templates, contribution guide, and a security contact with a private
disclosure path. Triage: 5 working days for a correctness or security issue, 15 for
everything else, stated in the repository so it can be held against us.

**3. Upstreaming the generic half.** The attestation interface, the public aggregate shape
and the conformance tests are what other issuers need and we do not need to own. We will
propose them for Splice or as a CIP, following the route Kaiko's Data Standard took. The
commodity-specific configuration stays in our repository.

**If the group stops operating**, the Apache 2.0 licence, the public history and the
documentation are sufficient for a third party to continue — and the acceptance criteria
require an unrelated issuer to have deployed from that documentation unaided, which is the
only real test of the claim.

---

## Direction after this grant — stated, not funded by it

None of this is in the milestones, the acceptance criteria or the costs. The Fund asks what
happens to software after a grant ends. The honest answer is that we will be depending on
these contracts, and here is what we intend to build on them.

**OTC settlement on the issuer's node.** A bilateral trade today either goes through a
venue or settles off-ledger and is reported back. The first adds a counterparty to a trade
two parties have already agreed; the second gives up atomicity. We want a quote, an
acceptance, and one transaction in which the metal token and the settlement asset change
hands or neither does.

The allocation work in the build track is **necessary but not sufficient**. Allocations
give the settlement leg: the redemption path is already written to settle against one. They
do not give the negotiation — nothing expresses a quote and an acceptance, and that is
net-new templates. And one dependency is not ours: atomic DvP needs the **settlement
asset's own registry** to implement allocations too. We cannot make USDCx allocatable from
our side. Our half becomes ready and the path opens when theirs does. The same applies to a
DvP venue listing, which is the same machinery at its third use. We raise it here rather
than in the ask because the grant should fund the primitive, not our use of it.

**Position netting.** An issuer settling many bilateral trades a day cares about the net
change in each counterparty's position, not the gross count. The accounting exists; netting
per participant per period does not. Which netting is correct is a real open question:
netting globally collapses a legitimate dealer chain, netting pairwise keeps it but misses
a circular one. OTC settling bilaterally on our own node is the pairwise case.

**Intraday settlement.** Settlement moves off a daily NAV onto an intraday cadence. The
decision is taken, and the whitepaper amendments are in train. It lands on the contracts
above rather than beside them: the time machinery today is the attestation freshness window
and the execution deadline, and intraday settlement is those tightening plus a NAV fixing
per window.

**Reserve-backed instruments as collateral.** OpenZeppelin's funded lending RI contemplates
vaults that are "multiply attested". A token whose supply cap is a ledger invariant and
whose reserves carry an independent attestor is that collateral. It needs no new contracts
from us — only the public aggregate this grant funds, which is what a lending protocol
would read to price a haircut.

**Further single-metal instruments.** Each additional metal is a configuration entry, an
attestation and a mint. That is business work, not protocol work, which is why it is not a
milestone here.

---

## Milestones and Deliverables

Funding is split **$205,000 build, $150,000 adoption**. Build milestones unlock on code and
documentation. Adoption milestones unlock only when parties other than Hawkrel use the
work. Reviewers should not pay for shelfware.

Adoption is close to parity with build. That follows from §2: the two largest build items
when this was first filed have since been built at our own cost and are not being asked
for. What remains on the build side is the multi-issuer work and the audit.

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

Target start on approval; the build track completes ~19 weeks later. Adoption milestones
have no fixed date: they are claimed when the evidence exists, and expire 12 months after
B3 acceptance if it does not.

### Build track — $205,000 / 2,105,000 CC

**B1 — Specification and ecosystem review (3 weeks, $30,000 / 308,000 CC)**

- Public specification for all six modules and the settlement, oracle and attestation
  interfaces, written against the contracts as deployed rather than as intended.
- Reviewed with the Token Standards and Decentralized Attestor Pools SIGs, and with at
  least two Canton venues or issuers; feedback documented in the repository.

**B2 — Multi-issuer implementation and TestNet (10 weeks, $110,000 / 1,130,000 CC)**

- N-of-M signer sets with on-ledger rotation and configurable approval policy, replacing
  the fixed issuer/reserve-holder pair.
- Provider-agnostic attestation interface and multi-attestor consensus, so an issuer can
  name several attestors and an assurance firm alongside an oracle feed.
- Allocations against DA's `splice-api-token-allocation-*-v2` interfaces, with the existing
  redemption path switched to settle against an allocation.
- Public aggregate live on TestNet **on-ledger at broad visibility**, with the holder table
  demonstrably absent.
- Reference integration against a RedStone CAPS root capsule for NAV.
- Both reference shapes completing full mint and redeem cycles against USDCx on TestNet.
- Tests extended to signer rotation, multi-attestor disagreement, allocation-settled
  redemption and aggregate correctness, each mutation-tested to the existing standard.
- Documentation sufficient for a third-party issuer to deploy without our assistance.

**B3 — Audit and MainNet (6 weeks, $65,000 / 667,000 CC)**

- Independent security audit of the Daml contracts; findings and fixes published, no
  unresolved critical or high findings.
- MainNet deployment of the reference instruments against live custody, price feeds and
  attestation.
- Public reserve and collateralization view live on MainNet data.
- Contribution guide, issue templates, security contact and the maintenance commitments
  published in the repository.

### Adoption track — $150,000 / 1,540,000 CC

Each adoption milestone can be evidenced **any one of three ways**, so it can be met
without publishing holder positions or confidential custody terms: **(a)** verifiable
MainNet transaction hashes or public repository evidence; **(b)** a formal Letter of
Dependency submitted privately to the committee by the adopting party; or **(c)** a joint
public announcement.

**A1 — Independent third-party deployment ($45,000 / 462,000 CC).** An issuer with no
commercial relationship to Hawkrel or ARU deploys a new instrument from the public
documentation, unaided, on TestNet or MainNet. This is the milestone that proves the Public
Good claim; it is deliberately the one we cannot satisfy ourselves.

**A2 — Venue listing or integration ($55,000 / 565,000 CC).** At least one Canton venue
lists or integrates an instrument issued with these contracts, with the attestation checked
as part of its acceptance path rather than trusted out of band.

**A3 — Sustained usage ($50,000 / 513,000 CC).** Twelve consecutive weeks with at least two
distinct issuers or venues transacting, a minimum of 200 settled batch or transfer events,
and a continuously maintained attestation and published aggregate throughout — the
infrastructure in service, not demonstrated once.

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
scope against a stable reference rather than a moving token price. The CC amounts are
derived from it, not the other way round.

**This request is $95,000 smaller than the figure first filed.** Two of its largest build
items were completed at our own cost in the interval and have moved into §2's left column.
The audit line has gone the other way.

**Development Fund request: 3,645,000 CC** — $205,000 build, $150,000 adoption. Converted
at $0.0974/CC, the September 2026 rate; «TODO: re-fix this rate on the submission date and
restate the CC figures, which move with it while the USD scope value does not».

**Basis.** The build track is costed bottom-up from the lines below, consistent with about
**1.8 FTE of Daml and backend engineering across the 19-week build track**, on the same
per-FTE basis RedStone states for CAPS. The engineering lines total $110,000; the rest is
audit, infrastructure and documentation.

For calibration: Kaiko's Data Standard was approved at 900,000 CC for a specification, with
no audit, no MainNet deployment and no redemption path. At the upper end, DA's Token
Standard V2 is 12,000,000 CC and RedStone's CAPS 15,775,000 CC. This request sits nearer
the lower band, which is where a scope including a full audit and a MainNet deployment of
already-written contracts belongs.

### Cost breakdown

Build track, $205,000:

| Item | USD | Share |
|---|---:|---:|
| Independent security audit, findings and fixes published | $70,000 | 34% |
| Daml: allocations against `splice-api-token-allocation-*-v2` | $35,000 | 17% |
| Daml: N-of-M signer governance and on-ledger rotation | $25,000 | 12% |
| On-ledger public aggregate at broad visibility (RFP-11) | $25,000 | 12% |
| Oracle and attestation interfaces — CAPS integration, multi-attestor consensus | $25,000 | 12% |
| Specification, documentation, conformance tests, SIG and community review | $20,000 | 10% |
| Infrastructure — MainNet and TestNet operation during the grant, CI, monitoring | $5,000 | 2% |
| **Total** | **$205,000** | **100%** |

**The audit is the largest line, and larger than first filed.** The surface to be audited
has roughly tripled, and the biggest addition is the 539-line redemption module — the code
that moves value out of the reserve. It is also the one line co-investment cannot cover:
everything else can absorb more of our own engineering time, and an audit cannot. Hacken's
own Dev Fund proposal prices its entire product build at $125,000, which is the reference
for what a credible Daml engagement costs.

Adoption track, $150,000: not allocated to line items. Paid against the evidence described
above, after the work is in use by someone other than us.

### Co-investment

The Fund expects an applicant to share the cost rather than transfer it. Hawkrel's
contribution is not a promise; much of it is already spent.

| Hawkrel co-investment | Form |
|---|---|
| Core contracts, registry service, operator view, test and mutation-test suites | Built before this request, at own cost |
| The full redemption and settlement path, and `InstrumentSupply` | Built **after** this request was first filed, at own cost, and withdrawn from the ask rather than invoiced against it |
| Economic-event derivation, the marker rule and its public evidence page | Built at own cost; the generic half offered upstream |
| DevNet validator (since 2026-07) and TestNet validator (since 2026-09) | Operated at own cost, including for the grant period |
| MainNet validator and the CIP-0116 featured-issuer lock | Own capital and financing; **not requested from the Fund** |
| Custody, assurance, compliance, index methodology, business development | Funded entirely separately |
| Maintenance for 24 months after final acceptance | Committed above |
| **Indicative value of work already delivered** | **«TODO: engineering cost to date, USD»** |

The Fund is asked to fund only the open-source deliverables in §2's net-new column. It is
not asked to fund ARU's product, its reserves, its validators or its listing economics.

### Volatility stipulation

The build track is under 6 months. Should it extend beyond 6 months because of
Committee-requested scope changes, remaining milestones are renegotiated against the fixed
USD scope value. Adoption milestones, which have no fixed date by design, are denominated
against the same fixed reference.

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
by ARU"* ([PR #87](https://github.com/canton-foundation/canton-dev-fund/pull/87)). Their
requirement is that tokens are minted only against fully allocated metal — which is the
attestation-capped mint, and the reason the asset class on an attestation is enforced
rather than advisory.

**Who benefits.** Any issuer of custody-backed assets on Canton — metals first, and with
the same interface any physically held RWA. Any venue, lender or counterparty that must
verify backing before accepting such a token, because the check becomes a contract
reference in the same transaction rather than a bilateral diligence exercise. And a funded
Canton security product whose Proof of Reserves Monitor is contingent on these attestations
existing on-ledger.

**Network activity.** Each deployment generates recurring on-ledger activity: batch
settlements, NAV updates, attestations, aggregate publications and AP flows. Attestation
and aggregate publication continue whether or not the instrument trades.

**Collateral diversification.** Commodity tokens settling atomically against USDCx extend
Canton's collateral universe beyond financial instruments, and give the DeFi reference
implementations the Fund is backing a non-financial collateral type to work with.

---

## Rationale

**Why Daml-native, not bridged?** A bridged ERC-20 cannot compose atomically with Canton
settlement assets, cannot reference Canton-side attestations in the same transaction, and
does not inherit Canton's privacy model. ARU's EVM token continues to exist separately;
this builds the Canton-native issuance path.

**Why extend CIP-56 rather than define a new standard?** The token is plain CIP-56, so it
works with existing wallets and venues, and the standard's own V2 work is DA's grant. The
new work is the issuance, redemption and attestation layer around it, which CIP-56
intentionally does not define.

**Why a batch window with multi-party approval?** Physical assets do not settle instantly,
and attestation data can be stale or wrong. A batch gives operators time to cross-check
custody confirmations before supply changes, and makes "do nothing" the safe default
without a pause switch or an admin key.

**Why separate the attestor from the issuer?** Because RFP-11 is right that an issuer's own
aggregate may not be trusted. The attestor signs what is held and cannot mint. The issuer
approves value and cannot move reserves. The reserve holder executes and cannot execute
unapproved. An aggregate signed by a party with no incentive to overstate it is worth more
than the same number published by the issuer.

**Why two reference shapes?** A single-metal token and a basket exercise different
configuration paths. Building both is what prevents the contracts being shaped around one
issuer — and it is already done, which is why the asset-agnostic claim is evidence rather
than intention.

**Why a weakness was disclosed before it was fixed.** An earlier revision of this document
named a real flaw in its own code: the mint guard compared against a supply figure the
issuer asserted rather than one the ledger derived, so an understated figure would
over-mint. It was disclosed because a reviewer who finds a flaw like that after approval
has reason to doubt everything else in the document. `InstrumentSupply` has since closed
it, and the line item that would have funded the fix is gone from the request. The
disclosure stays because the reason for making it does not expire once the bug is fixed,
and because §2's right-hand column is written to be checked the same way.

**Alternatives considered.** *Specification only* — rejected; venues need deployable,
audited code, and a specification would not have surfaced the V1/V2 conformance details or
the supply gap. *Gold-only token* — rejected; spot gold already trades on Canton, and
demand is for other metals and baskets. *Automated real-time minting* — rejected; it
creates a gap between issuance and physical allocation. *Admin-key issuer* — rejected;
single-key minting is the main failure mode for reserve-backed tokens. *Waiting for
OpenZeppelin's library* — rejected as a blocker, adopted as a dependency; none of it
addresses custody attestation, which is the half nobody else is building.
