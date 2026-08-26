## Development Fund Proposal

**Organization:** arCCade  
**Author / Primary Contact:** Melkor, arCCade — melkor@arccade.io — [@alituzun](https://github.com/alituzun)  
**Status:** Draft  
**Created:** 2026-08-26  
**Proposal Type:** Individual Initiative  
**RFP / Roadmap Area:** Developer infrastructure — reusable Daml package and client libraries for game economies  
**Champion:** `Needs Champion`  
**Total Funding Request:** 3,500,000 CC  
**Project Duration:** 14 calendar weeks  
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
| Current reference package | `arccade-game-sdk 1.3.0` |
| Current package hash | `bc607f6c6dbb3b29b38ff2428fe63f99068f9b67a8ce709a123378c1471c7e5a` |
| Daml SDK | 3.4.10 |
| LF | 2.1 |
| Token standard | CIP-0056 |
| Current status | Vetted and live on Canton TestNet |
| Requested term | 14 calendar weeks |
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

    bc607f6c6dbb3b29b38ff2428fe63f99068f9b67a8ce709a123378c1471c7e5a

which is byte-identical to the DAR vetted on Canton TestNet. The CIP-0056 interface DARs are vendored in-tree under Apache-2.0, so the build requires no setup, no network access, and no particular host layout. 39 Daml scripts and 56 JavaScript tests run from that same clone.

Reviewers are invited to verify this directly rather than take the claim on trust.

### Current state

- **160 automated tests passing**
- **4 languages at digest parity**
- **2 ledger writes per game-economy cycle**
- **1 live game on Canton TestNet**
- Package vetted on TestNet
- Real Canton Coin exercised through live game sessions

### Current component inventory

| Component | Purpose | Size | State |
|---|---|---:|---|
| `Cycle.daml` | Venue, entitlement, stake, two-write cycle | 386 LOC | Live |
| `Registry.daml` | CIP-0056 asset registry, accounts, quota-bounded minting | 540 LOC | Tested |
| `Trade.daml` | Atomic multi-leg trades | 165 LOC | Tested |
| `Custody.daml` | Proof that a stake is really locked | 97 LOC | Live |
| `Policy.daml` | Policy validity and terms-meet-policy check | 89 LOC | Live |
| `Digest.daml` | Canonical encoding and commitment digests | 120 LOC | Live |
| `Time.daml` | Single source of time | 44 LOC | Live |
| `test-package/` | 39 Daml scripts | 1,183 LOC | Passing |
| JavaScript client | Command builders, digests, tenancy; 56 tests | 1,360 LOC | Passing |
| HTTP layer | Multi-tenant settlement service; 65 tests | 5,656 LOC | Live |
| `Audit.daml` | Merkle anchoring of gameplay batches | - | Milestone 2 |
| Python / Java clients | Full client parity beyond digest | Partial | Milestone 3 |

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

The grant runs for **14 calendar weeks** and represents **42 engineer-weeks** of total effort delivered by the team above through parallel workstreams.

This is possible because the core system already exists. The funded work is extraction, hardening, packaging, audit, adoption, and standardisation rather than greenfield research.

Each milestone ends with an objective acceptance check.

### Milestone 1: Portable Build + Public Release

- **Estimated Delivery:** End of Week 3
- **Engineering Effort:** 6 engineer-weeks
- **Funding:** **450,000 CC**
- **Focus:** Package the existing portable core as a supported public SDK and remove remaining arCCade-specific operational assumptions.

#### Deliverables / Value Metrics

- Relocatable dependency resolution.
- Reproducible DAR build in CI.
- Public Apache-2.0 repository.
- JavaScript client published to npm.
- Clean-clone TestNet getting-started flow.
- Build and release documentation for independent use without proprietary arCCade infrastructure.
- A supported TestNet onboarding path: arCCade will assist external developers in reaching a working Canton TestNet participant and funded party, so that the SDK itself is the only thing they need to learn.

#### Acceptance

A developer with no arCCade infrastructure, working from a Canton TestNet participant and funded party, clones the public repository, follows the documentation, and completes a full stake-and-settle cycle within one hour of SDK-specific work.

---

### Milestone 2: On-Chain Enforcement + Audit Anchoring

- **Estimated Delivery:** End of Week 6
- **Engineering Effort:** 12 engineer-weeks
- **Funding:** **600,000 CC**
- **Focus:** Move documented guarantees into Daml and add independently verifiable audit anchoring.

arCCade's own testing identified a gap, which is stated here rather than left to be discovered. The venue's concurrency limit is **not enforced by the contract**: `GameVenue_IssueEntitlements` range-checks the slot index against the limit, but caps neither the number of entitlements a player holds nor their uniqueness. Until this milestone ships, the limit is enforced at the service layer. That is a real mitigation, but it is not an on-chain guarantee and is not described as one — the repository's README states this in the same terms.

#### Deliverables / Value Metrics

- Contract-level concurrency enforcement.
- Entitlement count and index uniqueness enforced on-ledger.
- `Audit.daml` Merkle anchoring.
- Independent verification tool.
- Regression and negative test suite.
- Documented upgrade path from the current reference package.

#### Acceptance

The upgraded package is vetted on Canton TestNet with concurrency enforced in-contract; a published gameplay-session anchor is independently verified using the public verification tool; and the upgrade path is documented and tested.

---

### Milestone 3: Client Parity + Reference Games

- **Estimated Delivery:** End of Week 10
- **Engineering Effort:** 12 engineer-weeks
- **Funding:** **600,000 CC**
- **Focus:** Make adoption independent of a studio's backend language and provide complete working examples.

The two reference games are arCCade's own existing titles, released as open source and migrated onto the public SDK. They are real shipped games with real players rather than tutorial code written to demonstrate an API, which is precisely what makes them useful as references.

#### Deliverables / Value Metrics

- Production-quality JavaScript, Python, and Java clients at feature parity.
- Shared conformance suite across all three clients.
- Two complete open-source reference games, both existing arCCade titles:
  - one real-time game;
  - one turn-based game.
- End-to-end examples for commitment, custody, settlement, recovery, and verification.
- Integration documentation for studios building without arCCade services.

#### Acceptance

All three clients pass the same conformance suite against a live Canton TestNet participant, and both reference games run end-to-end from a clean clone.

---

### Milestone 4: Security Audit + MainNet + External Adoption + CIP Draft

- **Estimated Delivery:** End of Week 14
- **Engineering Effort:** 12 engineer-weeks, plus the independent external audit
- **Funding:** **1,850,000 CC**
- **Focus:** Prove that the SDK works as shared ecosystem infrastructure rather than only as arCCade's internal technology.

#### Deliverables / Value Metrics

- Independent security audit of the Daml package.
- Resolution or documented disposition of audit findings.
- MainNet deployment and operations path, with arCCade's own titles settling real cycles on MainNet through the public SDK.
- Incident, recovery, and upgrade process.
- Published integration notes.
- **Three external studios integrated and settling game-economy cycles.**
- At least one external integrator completes the integration from public documentation without proprietary arCCade infrastructure.
- CIP draft submitted for the game-economy settlement pattern.

#### Acceptance

The independent audit report is published; material findings are resolved or formally dispositioned; the SDK is live on MainNet; three external studios are integrated and settling cycles; at least one integrator demonstrates a clean-docs integration; and the CIP draft has been submitted.

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

- **Milestone 1 — Portable Build + Public Release:** **450,000 CC**
- **Milestone 2 — On-Chain Enforcement + Audit Anchoring:** **600,000 CC**
- **Milestone 3 — Client Parity + Reference Games:** **600,000 CC**
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

### Contract-level concurrency is not enforced today

`GameVenue_IssueEntitlements` range-checks the slot index against the venue's concurrency limit, but caps neither the number of entitlements a player holds nor their uniqueness. arCCade found this through its own testing and is reporting it before award rather than after. Until M2 ships, the limit is enforced at the service layer — a real mitigation, but not an on-chain guarantee, and it is not described as one anywhere in this proposal or in the repository.

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
**Current reference package:** `arccade-game-sdk 1.3.0`  
**Daml SDK:** 3.4.10  
**LF:** 2.1  
**Token standard:** CIP-0056  
**Current network:** Canton TestNet  
**Requested term:** 14 calendar weeks  
**Delivery team:** 2 developers + 1 analyst  
**Total funding request:** 3,500,000 CC  
**Licence on release:** Apache-2.0
