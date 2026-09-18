## Development Fund Proposal

**Organization:** arCCade  
**Author / Primary Contact:** Melkor, arCCade — melkor@arccade.io — [@alituzun](https://github.com/alituzun)  
**Status:** Draft  
**Created:** 2026-08-26  
**Revised:** 2026-09-02 — package, inventory and milestone scope brought up to date; funding, duration and champion unchanged  
**Proposal Type:** Individual Initiative  
**RFP / Roadmap Area:** Developer infrastructure — reusable Daml package and client libraries for game economies  
**Champion:** `Needs Champion`  
**Total Funding Request:** 3,500,000 CC  
**Project Duration:** 3.5 months (14 calendar weeks)  
**Label:** dapp-integration  

---

# Proposal: Gaming SDK for Canton

**Open-Source Daml Infrastructure for Building Games on Canton**

**Two writes, one cycle.**

A reusable settlement primitive for game economies on Canton. Gameplay stays in the game's own database; the ledger is used for custody of value, cryptographic commitment, settlement, recovery, and auditability.

| Field | Value |
|---|---|
| Applicant | arCCade |
| Original developer | arCCade |
| Funded output | Gaming SDK for Canton |
| Repository | `github.com/arCCade/arccade-game-sdk` (public, Apache-2.0 on release) |
| Current reference package | `arccade-game-sdk 1.6.0` |
| Current package hash | `edb0af194381326861eb20da2e87d9698e9825172eb5ed3b4d381272dd811c3a` |
| Daml SDK | 3.4.10 |
| LF | 2.1 |
| Token standard | CIP-0056 — `HoldingV1`, `AllocationV1`, `TransferInstructionV1`, `AllocationV2` |
| Current status | Vetted and live on Canton TestNet |
| Requested term | 3.5 months (14 calendar weeks) |
| Delivery team | 2 developers + 1 analyst |
| Total engineering effort | 42 engineer-weeks |
| Milestones | 4 |
| Total funding request | **3,500,000 CC** |
| Licence on release | Apache-2.0 |

---

## Abstract

This proposal funds the conversion of a working arCCade game-economy stack into the **Gaming SDK for Canton**, an open-source Daml infrastructure package that any game studio can adopt without proprietary arCCade infrastructure.

The core design is deliberately narrow: gameplay remains off-chain, while economically meaningful state reaches Canton through a two-write cycle. Write 1 locks a player's stake and commits the game entry state. Write 2 records the outcome and releases custody. A canonical commitment digest binds the off-chain gameplay record to the on-chain settlement so that the result can be independently verified.

The reference implementation is already built, tested, vetted on Canton TestNet, and exercised with real Canton Coin through a live game. The grant is therefore not a greenfield build. The 14-week programme turns the existing portable implementation into a supported public SDK by removing remaining arCCade-specific operational assumptions, hardening guarantees on-ledger, publishing portable client libraries and reference games, adding audit anchoring, completing an independent security review, establishing a MainNet path, onboarding external studios, and submitting the settlement pattern into the CIP process.

The funded output will be Apache-2.0 licensed and usable by the Canton ecosystem independently of arCCade.

---

## Specification

### 1. Objective

**Problem:** Canton has strong primitives for custody, privacy, deterministic finality, and token settlement, but no reusable game-economy primitive that packages them for studios.

A normal game can generate thousands of state transitions in a single session. Writing gameplay state directly on-chain is neither economical nor desirable for privacy. The alternative today is for each studio to build its own bespoke bridge between an off-chain game and Canton, repeatedly solving custody, atomic commitment, settlement ordering, recovery, and verification.

The objective of this SDK is to standardize the part that should be shared:

- custody of a stake or game-economic position;
- cryptographic commitment to the entry state;
- settlement of the outcome;
- release or redistribution of value;
- recovery when a venue fails to settle;
- verification of off-chain gameplay against an on-chain commitment; and
- client libraries and reference implementations that make the pattern practical to adopt.

Gameplay engines, matchmaking, scoring logic, game design, and proprietary studio backends remain outside scope.

### 2. Implementation Mechanics

The SDK uses a **two-write game-economy cycle**.

#### Write 1: Commitment

The transfer that locks the stake executes in the same transaction as the choice that opens the game cycle.

Sequence:

1. `AmuletRules_Transfer` -> `LockedAmulet`
2. `Entitlement_Commit` + `GameStake`

The purpose is to prevent an unfunded game stake from existing as a claim on value that was never actually locked.

#### Write 2: Settlement

Settlement records the disposition, amounts, and outcome digest. The unlock then releases custody.

Sequence:

1. `GameStake_Settle` -> disposition
2. `LockedAmulet_UnlockV2` -> release

Settlement reads the lock, so settlement precedes unlock inside the same transaction.

Everything between Write 1 and Write 2 remains in the game studio's own store.

#### Commitment digest

The off-chain and on-chain halves are bound by a canonical commitment digest using:

- length-prefixed encoding;
- code-point lengths;
- amounts represented as integer `1e-10` units; and
- fields sorted by name.

The entry document is committed at Write 1. The outcome document is recorded at Write 2. Any party holding both can verify that the result settled on Canton corresponds to the original commitment.

Digest implementations exist in Daml, JavaScript, Python, and Java and agree byte-for-byte against shared golden vectors.

#### Recovery

An unsettled stake can be expired by the player acting alone, without cooperation from the venue. This recovery path has been exercised against live TestNet cycles.

#### Audit anchoring

The grant adds `Audit.daml`, allowing batches of off-chain gameplay to commit to an on-chain Merkle root. A verification tool will allow a third party to test a specific outcome against the published root without trusting the studio.

### 3. Architectural Alignment

The SDK is built around Canton rather than around a generic blockchain abstraction.

It uses:

- Amulet and `LockedAmulet` for real custody;
- Daml atomic transaction semantics for commitment and settlement;
- CIP-0056-compatible asset handling;
- Canton privacy boundaries rather than globally publishing gameplay state;
- deterministic finality;
- Daml-enforced policy and entitlement checks; and
- vetted package deployment on Canton TestNet with a defined MainNet path.

The SDK deliberately minimizes ledger use. Gameplay state is not written on-chain merely to create activity. Canton is used only where shared truth is economically meaningful: custody, commitment, settlement, recovery, and verifiable audit evidence.

**Ecosystem priority fit:** this work is developer infrastructure. It reduces the technical barrier for studios that would otherwise need to learn Daml, Splice internals, Amulet transfer mechanics, `LockedAmulet` lifecycle behavior, disclosed contracts, and network-specific settlement ordering before they can safely lock and settle value.

**Non-proprietary design:** arCCade is the applicant, builder, and first reference implementation, but the funded SDK will not require arCCade accounts, arCCade validators, arCCade APIs, or proprietary arCCade services.

### Roadmap alignment — and why this is still an individual initiative

The 2026–2027 Requests for Proposals were read before submitting. Two areas
under **Developer Experience, Tooling & Education** are adjacent to this work,
and neither is a clean fit — which is why this is filed as an individual
initiative rather than as a response to an RFP.

**RFP 14 — Wallet and dApp Integration tooling.** Its subject is the wallet as
an interface: signing flows, account and party management, application-to-wallet
interaction. This SDK sits one layer inward. It does not improve how a user
reaches a wallet; it defines what a game venue and a player's wallet agree to on
the ledger once they have met. The prior grants in that area — PartyLayer and
the dApp SDK — are complementary to this rather than overlapping with it.

**RFP 17 — SDKs in different languages.** Its subject is ledger client
libraries, held to the ledger client standard, making Canton APIs reachable from
a given language. This is not a ledger client. It is a domain package —
contracts plus the command builders and digests that go with them — and its
three clients speak to the package, not to the ledger API. Claiming RFP 17 would
invite a review against a standard this work is not trying to meet.

What it does advance, in the roadmap's own words: *reduced developer friction*,
*interoperability across wallets, assets, and dApps*, *token standards*, and
*documentation, examples, and training*. A studio adopting it does not have to
learn `LockedAmulet` lifecycle behaviour, disclosed contracts or settlement
ordering before it can safely hold and release a player's stake.

**The Foundation's own note is taken seriously.** Individual initiatives compete
with work already identified as a priority, and the bar is demand, community
support and a champion. Section *Demand Evidence* below addresses the first two.
The third is the reason this proposal is open.

**Suggested SIG:** dApp Integration.

### 4. Backward Compatibility

The SDK is additive.

It does not modify Splice, Canton network rules, CIP-0056, Amulet, or existing assets. It packages existing Canton primitives behind a reusable Daml and client-library interface.

Studios may adopt only the components they need. Existing Canton wallets and assets continue to use their normal transfer rails; the SDK coordinates custody and game settlement around those rails rather than replacing them.

---

## Current Implementation Status

This is not a proposal to start from zero.

### Verifiable before any funding is released

The repository is public at **`github.com/arCCade/arccade-game-sdk`**.

A clone at any path, with no arCCade infrastructure and no Splice installation on the host, builds to main package id

    edb0af194381326861eb20da2e87d9698e9825172eb5ed3b4d381272dd811c3a

which is byte-identical to the DAR vetted on Canton TestNet. The CIP-0056 interface DARs are vendored in-tree under Apache-2.0, so the build requires no setup, no network access, and no particular host layout. 39 Daml scripts and 56 JavaScript tests run from that same clone.

Reviewers are invited to verify this directly rather than take the claim on trust.

### Current state

- **378 automated tests passing** — 90 Daml scripts, 117 JavaScript, 115 Java, 56 Python
- **4 languages at digest parity**, locked to golden vectors
- **72 catalogued conformance capabilities**, three runners, one manifest
- **2 ledger writes per game-economy cycle**
- **1 live game on Canton TestNet**
- Package vetted on TestNet
- Real Canton Coin exercised through live game sessions

### Delivered since this proposal was drafted — unfunded

Between 26 August and 2 September 2026 arCCade shipped work this proposal had
scheduled as funded milestones. It is listed here rather than left inside the
milestones it was written for, because asking for money to do work already done
would misstate what the grant buys.

| Originally scheduled | Delivered | Evidence |
|---|---|---|
| M2 — contract-level concurrency enforcement | `PlayerRoster` and on-chain `concurrencyLimit` | v1.4.0, vetted on TestNet 27 Aug 2026 |
| M2 — `Audit.daml` Merkle anchoring | `Audit.daml`, `CycleAuditRow`, `VenuePeriodAnchor`, Merkle helpers | v1.5.0, vetted 27 Aug 2026; four-language parity locked to golden vectors |
| M3 — three clients at feature parity | JavaScript, Python and Java clients | 1.5.3 / 1.5.1 / 1.5.1 |
| M3 — shared conformance suite | 72 capabilities, three runners, one manifest | each runner exits with an error if the catalogue misstates its own capabilities |
| M1 — public Apache-2.0 repository | `github.com/arCCade/arccade-game-sdk` | public |
| M1 — JavaScript client on npm | `@arccade/game-sdk` | published, currently 1.5.1 |
| M1 — published documentation | `sdk.arccade.io` | live |
| *(not previously scheduled)* | `AllocationV2` — a committed allocation can hold a stake | v1.6.0 |

**The funding request, duration and milestone payments are unchanged.** What
changed is the scope those payments now buy: the milestones below have been
re-cut onto the work that genuinely remains, at the same total and over the same
fourteen weeks. The delivered work stands as evidence of delivery rate rather
than as a claim on the grant.

### Current component inventory

| Component | Purpose | Size | State |
|---|---|---:|---|
| `Cycle.daml` | Venue, entitlement, stake, two-write cycle, player roster | 613 LOC | Live |
| `Registry.daml` | CIP-0056 asset registry, accounts, quota-bounded minting | 540 LOC | Tested |
| `Digest.daml` | Canonical encoding and commitment digests | 218 LOC | Live |
| `Audit.daml` | Merkle anchoring of gameplay batches | 189 LOC | **Live** — was Milestone 2 |
| `Custody.daml` | Proof that a stake is really locked | 167 LOC | Live |
| `Trade.daml` | Atomic multi-leg trades | 165 LOC | Tested |
| `Policy.daml` | Policy validity and terms-meet-policy check | 89 LOC | Live |
| `Time.daml` | Single source of time | 44 LOC | Live |
| `test-package/` | 90 Daml scripts | — | Passing |
| JavaScript client | Command builders, digests, tenancy; 117 tests | 2,581 LOC | **Published** on npm |
| Java client | Digest, Merkle, audit reconstruction; 115 tests | 3,857 LOC | **Complete** — was Milestone 3 |
| Python client | Same surface, standard library only; 56 tests | 2,432 LOC | **Complete** — was Milestone 3 |
| `conformance/` | 72 capabilities, three runners, one manifest | — | Passing |
| Python client on PyPI | Public distribution | — | **Not published** — Milestone 1 |
| Java client on Maven Central | Public distribution | — | **Not published** — Milestone 1 |
| Independent verification tool | Third-party anchor verification | — | **Not built** — Milestone 2 |
| Backend integration | Reference venue wired to the package | — | **Not written** — Milestone 2 |
| Open-source reference games | Two arCCade titles on the public SDK | — | **Not released** — Milestone 3 |

"Live" means exercised on Canton TestNet against real Canton Coin.

---

## Live Proof

In August 2026, arCCade ran the complete cycle through a real game client using a real player account and TestNet Canton Coin.

Three racing-game sessions were executed with 30 CC staked per session, played to completion, settled, and claimed.

The settlement transaction contained `GameStake_Settle` and `LockedAmulet_UnlockV2`, returned the full stake where the disposition was `ReturnedInFull`, released the player's slot, and returned the locked balance to zero.

Live testing exposed and closed failures that a new studio would otherwise discover independently, including:

- a stake instrument bound to the wrong administrator;
- a commitment that was not atomic with its transfer; and
- settlement ordering that attempted to read a lock after releasing it.

The same run demonstrated player-side recovery by successfully recovering three stranded cycles without venue cooperation.

---

## Team

The programme is delivered by a team of three:

| Role | Count | Responsibility |
|---|---:|---|
| Developer | 2 | Daml package, client libraries, reference game integration, MainNet operations |
| Analyst | 1 | Conformance and regression testing, integration documentation, audit liaison, adopter support |

The independent security audit in Milestone 4 is contracted externally and is not included in the 42 engineer-weeks below.

Milestone dates are **acceptance dates, not exclusive work windows**. Workstreams overlap: external adopter engagement, MainNet preparation, and documentation begin early in the programme and run alongside package development rather than after it. The 14-week schedule depends on this parallelism.

---

## Milestones and Deliverables

The grant runs for **14 calendar weeks** and represents **42 engineer-weeks** of
total effort delivered by the team above through parallel workstreams. The
funding request, the schedule and the per-milestone payments are unchanged from
the original draft.

**What changed is the scope.** Work this proposal had scheduled inside
Milestones 1–3 shipped unfunded between 26 August and 2 September and is listed
under *Delivered since this proposal was drafted*. The milestones below are
re-cut onto the work that genuinely remains. The same money now buys distribution,
independent verification, a wired reference venue, an external audit, MainNet and
adoption — a scope the original draft reached only in its final milestone.

This is possible because the core system already exists. The funded work is
distribution, hardening, audit, adoption and standardisation rather than
greenfield research.

Each milestone ends with an objective acceptance check.

### Milestone 1: Distribution and Portable Onboarding

- **Estimated Delivery:** End of Week 3
- **Engineering Effort:** 6 engineer-weeks
- **Funding:** **450,000 CC**
- **Focus:** Make every client installable from a public registry, and make a
  clean-clone start work for someone with no arCCade infrastructure.

The public repository, the npm package and the documentation site shipped
unfunded and are listed above. What remains is the rest of the distribution
surface: the Python client is not on PyPI and the Java client is not on Maven
Central, so today two of the three clients can only be used by vendoring source.

#### Deliverables / Value Metrics

- `arccade-game-sdk` published to PyPI, versioned in step with the package.
- `io.arccade:game-sdk` published to Maven Central, signed.
- npm package brought level with the repository and release-tagged.
- Reproducible DAR build asserted in CI against the vetted package id.
- Build and release documentation for independent use without arCCade infrastructure.
- A supported TestNet onboarding path: arCCade will assist external developers in
  reaching a working Canton TestNet participant and funded party, so that the SDK
  itself is the only thing they need to learn.

#### Acceptance

A developer with no arCCade infrastructure, working from a Canton TestNet
participant and funded party, installs each client from its public registry,
follows the documentation, and completes a full stake-and-settle cycle within one
hour of SDK-specific work.

**Adoption measure:** all three clients resolvable from their public registries,
and **at least one developer outside arCCade** completes the onboarding path and
reports the result. Registry availability is a precondition for adoption, not
adoption itself, so the milestone is not accepted on publication alone.

---

### Milestone 2: Independent Verification and a Wired Reference Venue

- **Estimated Delivery:** End of Week 6
- **Engineering Effort:** 12 engineer-weeks
- **Funding:** **600,000 CC**
- **Focus:** Make the audit trail checkable by someone who does not trust
  arCCade, and make the reference venue a real integration rather than a
  description of one.

On-chain concurrency enforcement and `Audit.daml` shipped unfunded in v1.4.0 and
v1.5.0. Two things that milestone existed for did not.

**The anchor is only evidence if a third party can check it.** The Merkle
anchoring exists and four languages agree on the digest, but there is no tool a
reviewer can run against a published anchor without our code path. Until there
is, the guarantee rests on our implementation rather than on verification.

**The reference venue is not wired to the package.** The commitment and
settlement path in arCCade's own backend does not yet go through the public SDK.
An SDK whose author does not use it is a library, not infrastructure — and this
is stated here rather than left to be discovered.

#### Deliverables / Value Metrics

- Independent verification tool: given a published anchor and the ledger stream,
  reconstructs the rows and confirms the root, using no arCCade service.
- arCCade's backend commitment and settlement path migrated onto the public SDK.
- Pixel Race stake-at-start migrated onto the same path.
- Regression and negative test suite for both.
- Documented upgrade path from every vetted package version to 1.6.0.

#### Acceptance

A reviewer takes a published gameplay-session anchor and the public ledger
stream, runs the verification tool from a clean clone, and reproduces the root
without contacting arCCade. arCCade's own titles settle cycles through the public
package rather than through internal code, and the upgrade path is documented and
tested against a live TestNet participant.

**Adoption measure:** **at least one party outside arCCade** independently
verifies a published anchor. The tool's value is that someone who does not trust
us can check us; a tool only ever run by its author has not demonstrated that.

---

### Milestone 3: Reference Games and Studio-Ready Documentation

- **Estimated Delivery:** End of Week 10
- **Engineering Effort:** 12 engineer-weeks
- **Funding:** **600,000 CC**
- **Focus:** Give a studio two complete, real integrations to read, and the
  documentation to follow without asking us anything.

Client parity and the shared conformance suite shipped unfunded. What remains is
the part that makes the clients usable by someone else: worked, open-source games
rather than adapter modules, and integration documentation written for a studio
that has never spoken to arCCade.

#### Deliverables / Value Metrics

- Two complete open-source reference games, both existing arCCade titles:
  - one real-time game;
  - one turn-based game.
- Both migrated onto the public SDK and released under Apache-2.0.
- End-to-end examples for commitment, custody, settlement, recovery and verification.
- Integration documentation for studios building without arCCade services.
- Conformance suite extended to cover the paths the reference games exercise.

#### Acceptance

Both reference games run end-to-end from a clean clone against a live Canton
TestNet participant, and all three clients pass the conformance suite against the
same participant.

**Adoption measure:** **at least one external team** runs a reference game from
the public repository against its own participant and reports what it took. If
the documentation is only ever followed by the people who wrote it, it has not
been tested.

---

### Milestone 4: Security Audit + MainNet + External Adoption + CIP Draft

- **Estimated Delivery:** End of Week 14
- **Engineering Effort:** 12 engineer-weeks, plus the independent external audit
- **Funding:** **1,850,000 CC**
- **Focus:** Prove that the SDK works as shared ecosystem infrastructure rather
  than only as arCCade's internal technology.

This milestone is unchanged from the original draft. It was the hardest one then
and it is the hardest one now: everything before it is work arCCade can do
alone, and this is the part that requires other people.

#### Deliverables / Value Metrics

- Independent security audit of the Daml package.
- Resolution or documented disposition of audit findings.
- MainNet deployment and operations path, with arCCade's own titles settling real
  cycles on MainNet through the public SDK.
- Incident, recovery, and upgrade process.
- Published integration notes.
- **Three external studios integrated and settling game-economy cycles.**
- At least one external integrator completes the integration from public
  documentation without proprietary arCCade infrastructure.
- CIP draft submitted for the game-economy settlement pattern.

#### Acceptance

The independent audit report is published; material findings are resolved or
formally dispositioned; the SDK is live on MainNet; three external studios are
integrated and settling cycles; at least one integrator demonstrates a
clean-docs integration; and the CIP draft has been submitted.

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion using objective published evidence.

- Deliverables completed as specified for each milestone.
- Public repository state and release artifacts.
- TestNet/MainNet transaction evidence for working settlement cycles.
- Shared client conformance results.
- Reference games runnable from clean clones.
- Published external security audit.
- External studio integration evidence.
- CIP submission evidence.
- Documentation sufficient for a developer outside arCCade to integrate independently.

Project-specific conditions:

- **No self-certification:** arCCade is comfortable with milestone acceptance being determined by Foundation technical reviewers.
- **MainNet dependency:** package re-vetting and MainNet timing depend partly on network governance. TestNet package acceptance is used for M2; MainNet is carried by M4.
- **External adoption is a real gate:** M4 is not accepted merely because arCCade completes its own integration. The three external-studio target must be demonstrated.
- **Security findings are part of the work:** publishing an audit alone is not sufficient; material findings must be resolved or formally dispositioned.

---

## Sustainability

The Gaming SDK for Canton will be released under Apache-2.0 in a public repository.

arCCade is also the first production consumer of the architecture. Two of arCCade's shipped titles migrate onto the public SDK during this programme, so maintenance is a dependency of arCCade's own operations rather than a commitment of goodwill that ends when grant funding does.

The CIP submission is intended to move the settlement pattern from a single implementation toward an ecosystem-governed target that other implementations can adopt.

The public repository, Daml packages, client libraries, conformance tests, reference games, verification tooling, and documentation remain usable by the ecosystem even if arCCade later stops developing the SDK.

---

## Funding

**Total Funding Request: 3,500,000 CC**

### Payment Breakdown by Milestone

- **Milestone 1 — Distribution and Portable Onboarding:** **450,000 CC**
- **Milestone 2 — Independent Verification and a Wired Reference Venue:** **600,000 CC**
- **Milestone 3 — Reference Games and Studio-Ready Documentation:** **600,000 CC**
- **Milestone 4 — Security Audit + MainNet + External Adoption + CIP Draft:** **1,850,000 CC**

### Adoption-Based Share

**1,850,000 of 3,500,000 CC (52.9%)** is gated on Milestone 4, which requires MainNet deployment, an independent security audit, three external studio integrations, at least one documentation-only external integration, and CIP submission.

The majority of the grant is therefore not released merely for producing code. It depends on proving that the SDK functions as reusable Canton ecosystem infrastructure.

Payments are milestone-based rather than an upfront 47.1% / final 52.9% split. Milestones 1–3 together represent 1,650,000 CC (47.1%) and are paid as each milestone is accepted. Milestone 4 represents 1,850,000 CC (52.9%) and is paid only after the final adoption, audit, MainNet, and CIP acceptance criteria are met.

### Cost Basis

The programme represents **42 engineer-weeks over 14 calendar weeks**, delivered by 2 developers and 1 analyst working across parallel, overlapping workstreams.

- **M1:** 6 engineer-weeks focused on build portability, packaging, CI, public release, and JavaScript distribution.
- **M2:** 12 engineer-weeks focused on Daml hardening, on-chain enforcement, Merkle audit anchoring, verification tooling, and upgrade testing.
- **M3:** 12 engineer-weeks focused on Python/Java parity, conformance, migrating two existing arCCade titles onto the public SDK as open-source references, and integration documentation.
- **M4:** 12 engineer-weeks focused on MainNet operations, external adopter support, incident/upgrade procedures, and CIP work, plus the independent external security audit, which is contracted separately and is not counted in the engineer-weeks above.

M4 carries the largest funding share because it contains the independent audit and the adoption risk. Payment is contingent on external outcomes rather than arCCade's internal completion alone.

### Volatility Stipulation

The project duration is **under 6 months**. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Demand Evidence

The SDK is derived from a working use case rather than a hypothetical architecture.

- arCCade already runs a live game against Canton TestNet and has exercised real Canton Coin through the two-write cycle.
- Live integration has already surfaced failure modes that generic examples do not expose, including instrument administration, atomic commitment, settlement ordering, and player-side recovery.
- Two shipped arCCade titles migrate onto the public SDK during the programme, so the reference implementations are games with real players rather than demonstrations.
- The core problem is reusable across game categories: studios need verifiable custody and settlement without moving high-frequency gameplay state on-chain.
- Milestone 4 makes external demand measurable by requiring three independent studio integrations rather than treating arCCade's own use as sufficient evidence of ecosystem adoption.

---

## Co-Marketing

Upon public release and milestone completion, arCCade will coordinate with the Canton Foundation on:

- announcement of the open-source Gaming SDK for Canton;
- a technical write-up explaining the two-write game-economy pattern;
- publication and promotion of the two reference games;
- a developer walkthrough or workshop for studios and Canton builders;
- MainNet launch communication; and
- communication around the CIP submission and external studio integrations.

---

## Motivation

### Portion of the ecosystem that benefits

Canton currently has no established gaming category. There is no dedicated gaming SIG in the Foundation's directory, no gaming-focused proposal in this repository, and no other publicly documented game settling value on the network today besides arCCade. A percentage of such a small emerging category would not be meaningful, so the more useful measure is an absolute one.

**Today:** one studio (arCCade), two titles, TestNet only.

**At the end of this grant:** three titles settling on MainNet, three external
studios integrated, and at least one integration completed from public
documentation alone. That last one is the measure that matters, because it is
the first evidence that the category can grow without us in the room.

**How the addressable set is reached.** Game developers do not read ledger
documentation looking for a settlement primitive; they arrive through events and
incentives. arCCade will run hackathons and an incentive programme aimed at the
wider gaming developer population — a group that today has no reason to evaluate
Canton at all, because the primitive they would need does not exist. The SDK is
what makes that outreach answerable: a studio that shows up can be handed
something that already works rather than an argument that it could.

We would rather be measured against three real integrations than against a
market-share figure for a market that does not yet exist.

### Why this is valuable to the Canton ecosystem

- Game studios should not need to become experts in Splice internals before they can safely use Canton assets.
- High-frequency gameplay is a poor candidate for naive on-chain execution, but game-economy custody and settlement benefit directly from Canton.
- Every studio independently rebuilding custody, commitment, settlement, recovery, and verification wastes ecosystem engineering time.
- A shared Apache-2.0 SDK turns those lessons into reusable infrastructure.
- Client parity and complete reference games reduce integration friction.
- A public security audit and external-studio adoption provide evidence beyond the applicant's own implementation.
- A CIP submission creates a path toward a common game-economy settlement pattern rather than a single-vendor convention.

---

## Rationale

### Why not put gameplay itself on-chain?

Because that would optimize for transaction count rather than product quality. Games generate high-frequency state transitions that belong in the game's own execution environment. Canton should record the state that needs shared economic truth: custody, commitment, settlement, recovery, and audit evidence.

### Why exactly two writes?

The first write must atomically bind custody to the opening commitment. The second must atomically bind the recorded outcome to the release or disposition of that custody. Splitting either boundary creates failure states the SDK is specifically designed to remove.

### Why is the commitment digest first-class?

The digest is what allows off-chain gameplay and on-chain settlement to coexist without asking users or reviewers to trust the studio's database. The entry state and final result can be compared against a canonical commitment.

### Why add Merkle anchoring?

A single commitment proves one cycle. Merkle anchoring lets a studio commit a batch of gameplay records to one on-chain root while preserving the same independent-verification property for individual outcomes.

### Why is this not simply an arCCade library?

The grant scope explicitly removes arCCade-specific dependencies. Acceptance requires clean-clone use without arCCade infrastructure, public client libraries, open-source reference games, an external security audit, MainNet deployment, three external studio integrations, and a CIP submission.

### Why not extend something that already exists?

The Foundation's default, correctly, is to extend rather than duplicate. There is
nothing here to extend, and the parts that do exist are used directly rather than
wrapped.

**The CIP-0056 token-standard interfaces** are a dependency, not a competitor.
The SDK builds against `HoldingV1`, `AllocationV1` and
`TransferInstructionV1` and vendors those DARs unmodified. It adds no interface
of its own to that layer and proposes no change to it.

**Amulet and `LockedAmulet`** provide the custody. The SDK does not re-implement
locking or wrap it behind an abstraction; it exercises `AmuletRules_Transfer` and
`LockedAmulet_UnlockV2` as they are, and the value of the work is in what it
composes them WITH — an atomic commitment and a settlement that reveals a
verifiable outcome.

**The existing client SDKs** — the TypeScript dApp SDK, and the community Rust,
Go, Python and C# libraries — sit at a different layer. They are Ledger API
clients: they help an application talk to Canton. None of them has an opinion
about what a session-based economy should write, when custody may be released,
or how an off-chain result is bound to an on-chain record. A game built on any
of them still has to make every one of those decisions itself, which is exactly
the work this proposal removes.

**What genuinely does not exist** is a primitive that models a play session as a
unit of settlement: stake custody, an entry commitment fixed before play, an
outcome revealed at settlement, and a recovery path the player can take alone.
No Canton component offers a subset of that to extend. Where prior art does exist
the SDK uses it; where it does not, the SDK is deliberately small, and the CIP
submission in Milestone 4 exists so that this gap is filled by an
ecosystem-governed pattern rather than by one vendor's library.

### Why arCCade?

Because the applicant has already built and exercised the architecture against Canton TestNet and has already paid the engineering cost of discovering real network failure modes. The grant converts that implementation knowledge into public infrastructure instead of asking the next studio to rediscover the same failures.

---

## Risks, Stated Plainly

### ~~Contract-level concurrency is not enforced today~~ — closed

The original draft reported that `GameVenue_IssueEntitlements` range-checked the
slot index but capped neither the number of entitlements a player holds nor their
uniqueness, leaving the limit enforced at the service layer. `PlayerRoster` and
on-chain `concurrencyLimit` enforcement shipped in v1.4.0 and were vetted on
TestNet on 27 August 2026. The risk is retained here, struck through, because a
reviewer comparing the two drafts should be able to see what was disclosed and
what became of it.

### The SDK's author does not yet use the SDK

arCCade's own backend still runs its commitment and settlement path through
internal code rather than through the public package. That is a real gap and it
is the reason Milestone 2 now carries the integration: an SDK whose author has
not adopted it has not been proven at the boundary that matters. Stated before
award rather than after.

### Upgrade timing depends on Canton network governance

The upgraded package requires re-vetting. TestNet acceptance can be targeted directly; MainNet timing is partly outside arCCade's control. arCCade accepts this risk as stated and has scheduled M2 accordingly.

### External adoption is the hardest milestone

Three independent studios are an intentionally difficult acceptance target. It is the strongest test of whether Canton gained shared infrastructure rather than an arCCade-specific codebase.

### Security review may identify additional work

The external audit is intended to find issues. M4 therefore includes remediation or formal disposition of material findings as part of acceptance.

---

## Deliverables at Completion

At the end of the 14-week programme, the Canton ecosystem is expected to have:

- an Apache-2.0 Gaming SDK for Canton;
- portable, reproducible Daml builds;
- a clean TestNet integration path;
- a MainNet deployment path and live MainNet SDK deployment;
- real stake custody and atomic game-economy settlement primitives;
- on-chain enforcement of concurrency guarantees;
- canonical commitment digests across Daml, JavaScript, Python, and Java;
- Merkle audit anchoring and public verification tooling;
- JavaScript, Python, and Java clients at full parity;
- two complete open-source reference games, both shipped arCCade titles migrated onto the public SDK;
- a published independent security audit;
- three external studio integrations;
- incident, recovery, upgrade, and integration documentation; and
- a submitted CIP draft for the game-economy settlement pattern.

The intended result is a primitive that a Canton game studio can adopt rather than rebuild.

---

**Applicant:** arCCade  
**Project:** Gaming SDK for Canton  
**Repository:** `github.com/arCCade/arccade-game-sdk`  
**Current reference package:** `arccade-game-sdk 1.6.0`  
**Daml SDK:** 3.4.10  
**LF:** 2.1  
**Token standard:** CIP-0056  
**Current network:** Canton TestNet  
**Requested term:** 3.5 months (14 calendar weeks)  
**Delivery team:** 2 developers + 1 analyst  
**Total funding request:** 3,500,000 CC  
**Licence on release:** Apache-2.0
