## Development Fund Proposal

**Organization:** Independent (Rume Dominic / O'Rume Dominic Uririe)
**Author / Primary Contact:** Rume Dominic, dominicrume@gmail.com, github.com/dominicrume
**Status:** Draft
**Created:** 2026-09-06
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. **RFP 27, Security
Monitoring, Auditability and Evidence**
**Champion:** `Needs Champion`
**Total Funding Request:** 300,000 CC
**Project Duration:** 16 weeks
**Label:** regulatory-compliance

---

## Abstract

Canton keeps transaction detail private, which means an institution cannot prove
its own conduct to a counterparty or a regulator by showing them the ledger. The
gap is sharpest for actions that were **stopped**: an ordinary audit log contains
what a system did, and the party who writes that log is the party the question is
about.

This proposal delivers an open, implementation-neutral evidence format for
**authorisation decisions, the refusals as well as the approvals**, with three
properties: an entry cannot be removed or edited without detection, the record can
be checked by anyone with no wallet, node or account, and its integrity is bound
to Canton without publishing what it contains.

The format, a conformance suite and a Daml reference implementation already exist,
are MIT-licensed and are reproducible from a clean clone. This grant funds the work
that turns them from one applicant's repository into a layer running inside
Canton applications the applicant does not own.

---

## Specification

### 1. Objective

**One objective: a privacy-preserving, tamper-evident evidence format for
authorisation decisions on Canton, with a conformance suite that lets any
application produce records another party can verify.**

The problem is specific. Under Canton's privacy model, a participant sees only the
sub-transactions it is a stakeholder in. That is the correct design, and it means
compliance evidence cannot be assembled by an outside observer, it has to be
produced by the participant, which is exactly the party whose conduct is in
question. Self-attested evidence is worth what the attestor's reputation is worth.

The narrower half of the problem is refusals in deterministic settlement. When an authorisation check stops an
action, nothing durable is created on-ledger, because nothing happened. There is no
contract, no event, no archive. The attempt exists only in whatever the application
chose to log. RFP 27 asks for "audit trails, compliance evidence... while preserving
Canton's privacy model", and refused authorisations are the part of that trail with
no ledger artefact behind it. By committing a rejection record to the ledger,
refusals become explicitly modeled in Daml. The template is `ChargeRefused`;
the pattern was named `RejectedAttempt` by Federico_Rodriguez, a Canton
Community Tech Partner, who read the design on the forum and specified it a day
before it was built.

**In scope:** the record format and its canonicalisation; a conformance vector suite
and a language-neutral grader; a Daml reference implementation of a bounded mandate
whose refusals are covered by named tests; an on-ledger anchor that binds a record
to its origin without disclosing contents; a browser verifier requiring no install;
and merged integrations into at least two Canton applications not written by the applicant.

**Out of scope:** custody, key management, payment licensing, identity issuance,
zero-knowledge proving systems, and any claim that this constitutes regulatory
approval in any jurisdiction.

### 2. Implementation Mechanics

**The record.** An entry is a JSON object naming what was attempted, the rule that
allowed or refused it, the outcome, and the ledger that answered. Its seal is
`sha256(canonical(entry_without_seal) + previous_seal)`, where `canonical` is JSON
with sorted keys, `","` and `":"` separators, and non-ASCII escaped. Entries chain,
so removing or editing one breaks every seal after it. The canonicalisation is the
whole specification, it is what lets independent implementations agree byte for
byte, and it is the part that most needs conformance vectors rather than prose.

**Why a hash chain rather than signatures.** Verification must be possible with no
key distribution, no PKI and no network. A reader with the file and a SHA-256
implementation can check integrity. Signatures answer a different question, who
wrote this, which the anchor below answers on-ledger instead.

**The anchor.** A chain that is internally consistent proves only internal
consistency; a chain forged from scratch verifies perfectly. The head seal and entry
count are published in a Daml contract. An outside party asks the ledger whether a
given head was ever anchored. A forged chain verifies green and answers
`NOT ANCHORED`. **No entry content reaches the ledger**, only a hash and a count, so the privacy model is preserved while integrity becomes externally checkable.

**The mandate.** The reference implementation is a Daml template whose `Charge`
choice body carries the authorisation fences as `assertMsg` assertions: total cap,
per-period limit, allow-list, expiry, positive amount. Revoke is a consuming choice,
so it archives the mandate rather than asserting against it. Refusals are produced
by the ledger as a `ChargeRefused` contract, not by application code, which is what makes the resulting evidence
worth more than a log line.

**What already exists and is reproducible from a clean clone**, all figures
re-verified on 2026-09-06 and defensible on request:

| | |
|---|---|
| Daml attack scripts | 100 of 100 pass; 30 of 44 template choices exercised, the other 14 are Daml's auto-generated `Archive` |
| Fence coverage | 30 of 30 `assertMsg` fences mutation-tested, deleting any one turns a **named** test red |
| Suite integrity | 23 real defects introduced deliberately, each requiring the suite that claims to cover it to fail; every one does |
| Format agreement | 3 independent implementations (Python, JavaScript, Go) across 20 conformance vectors |
| Interface robustness | 553 malformed requests over every route and field; zero dropped connections, zero server errors |
| Deployed | `kya-rails-mandate` **1.1.1** built on SDK 3.4.11 (100/100 scripts); **1.1.0** is what is vetted on Canton DevNet, as an upgrade of 1.0.0 |
| Installable today | `pip install knowyouragenticai-receipts`, **1.1.0**, MIT, **zero dependencies**, with the conformance vectors inside it so `python -m knowyouragenticai_receipts selftest` reports 20/20 offline |

Two of the 16 vectors exist because the question asked was which *wrong*
implementations would still pass. Two did.

**Operational approach.** Stdlib-only in every implementation, no runtime
dependencies, MIT licence. The verifier is a single HTML file that works from a
local disk. This is deliberate: an evidence format whose verification requires
installing the producer's software is not evidence.

### 3. Architectural Alignment

This uses Canton for the one thing only Canton can do here, bind a private record
to a ledger without publishing it, and does nothing on-ledger that does not need to
be. The mandate template is a building block any application can instantiate, not an
application competing with one.

It is deliberately scoped **beneath** the Identity and Metadata SIG's work rather
than beside it. RFP 12.1 asks for provider-neutral credential standards including
*"authority to act on behalf of an institution."* A mandate is a bounded instance of
exactly that credential, and the evidence format here is what makes its exercise, and its refusal, checkable afterwards. This proposal does **not** attempt the
credential standard: the template asks for a single objective, and credential
issuance and evidence recording are different problems on different timeframes. The
intended relationship is that this work produces the verification substrate a later
credential standard can cite, and Milestone 3 includes a written alignment note
agreed with the Identity and Metadata SIG rather than asserted at them.

Relevant prior art it extends rather than replaces: the Foundation's existing
`daml-lint`, `daml-props` and `daml-verify` tooling operate on source before
deployment; this operates on decisions after deployment. Hacken's Canton Monitor
(Dev Fund #302) detects anomalies at a participant's own trust boundary and emits
SIEM alerts; those alerts are observations by the monitor's operator. This format is
complementary and lower in the stack: it is the tamper-evident artefact an operator
hands to someone who does not trust them.

### 4. Backward Compatibility

No backward compatibility impact. The format is additive and the mandate template is
a new package. Nothing here changes an existing interface, and applications that do
not adopt it are unaffected. Version 1.1.0 is already vetted as an upgrade of 1.0.0
on DevNet, so the upgrade path is exercised rather than assumed.

---

## Milestones and Deliverables

Sixteen weeks, four milestones. Milestones 1 and 2 deliver the specification and
the library. Milestones 3 and 4 are accepted on the format running inside
applications the applicant does not own, delivered as merged pull requests the
committee can open and read. They pay for integration, not for artefacts, and
integration is something the applicant can go and do rather than wait for.

### Milestone 1: Specification hardening and independent conformance
- **Estimated Delivery:** Week 4
- **Focus:** Make the format implementable by someone with no contact with the applicant.
- **Deliverables / Value Metrics:**
  - Specification revised against the ambiguities found by a third party attempting an implementation from the document alone, with each ambiguity recorded.
  - Conformance vector set expanded from 16, every addition justified by a wrong implementation that previously passed.
  - Language-neutral grader runnable against any executable over a pipe.
  - **Value metric:** one implementation in a language not currently covered, written by someone other than the applicant, passing the full vector set.

### Milestone 2: Mandate library and independent Daml review
- **Estimated Delivery:** Week 8
- **Focus:** Make the reference implementation safe to depend on.
- **Deliverables / Value Metrics:**
  - Mandate template generalised from the applicant's use case to a reusable library with documented extension points.
  - Independent Daml security review, commissioned from a reviewer with no involvement in the work; findings and remediation published in full, including any that are not fixed and why.
  - Threat model and privacy matrix published: who signs, who observes, who is excluded, for every contract.
  - **Value metric:** review completed and published; all findings rated high or above either remediated or documented with a stated reason.

### Milestone 3: Integration into two existing Canton rails

**Where this stands today, stated rather than implied.** The pattern is now a
separate package, `canton-refusal-record`, so an application can depend on the
refusal record without inheriting a spend-limited wallet, and its test suite
includes a lending protocol and a collateral engine using it with no concept of
a payee. That removes the reason a team would have had to say no.

It does not remove the other one: **nobody has been asked yet.** No integration
proposal has been made to any team, and this milestone is the work of making
those asks and seeing them through, not of writing more code. The code is the
precondition and it is done.
- **Estimated Delivery:** Week 12
- **Focus:** The format running inside somebody else's application, with the applicant doing the integration work.
- **Deliverables / Value Metrics:**
  - Integration into **two Canton applications the applicant does not own**, delivered as a pull request to each, with the applicant writing the integration and the host team reviewing and merging it. This is an evidence layer, not a platform: nobody adopts a layer, they drop it into a rail they already run.
  - A minimal adapter per host, published in this repository, so the next integration is a copy rather than a conversation.
  - Written alignment note agreed with the Identity and Metadata SIG on the boundary between this evidence layer and credential standards under RFP 12.1.
  - **Value metric:** **two merged pull requests in repositories outside the applicant's control, each producing records that pass the conformance suite**, named in the milestone submission and independently checkable by anyone.

### Milestone 4: Running in production, and handover
- **Estimated Delivery:** Week 16
- **Focus:** Survive the applicant losing interest.
- **Deliverables / Value Metrics:**
  - Anchor verification available as a library, not only as a page.
  - Maintainer documentation sufficient for a second maintainer, and a named second maintainer accepting commit rights.
  - Listed in the Canton Developer Hub catalogue with a current SDK version.
  - **Value metric:** **at least one of the Milestone 3 integrations running against a Canton environment rather than a local file, producing anchored records**, and a third integration merged or in review.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions, all externally checkable:

1. **Milestone 3 does not pass on the applicant's own usage.** The two
   integrations must be merged pull requests in repositories the applicant does
   not own, each producing conforming records, and both must be named so the
   committee can open them.
2. **An implementation the applicant did not write must pass the conformance suite**
   from the specification alone.
3. **The independent Daml review must be published in full**, including findings not
   remediated and the reason each was not.
4. **A second maintainer with commit rights must accept**, in writing, before the
   final milestone is accepted.
5. **Every quantitative claim in a milestone submission must be reproducible from a
   clean clone** by a reviewer, using a documented command.

Criterion 5 is offered deliberately. The applicant's method treats an untested claim
as an unmade one, and the same standard should apply to what is said to this
committee.

---

## Funding

**Total Funding Request:** 300,000 CC

Total scope for the sixteen weeks is estimated at **$36,000 USDT**, fixed at the date
of submission. The Foundation grant covers the portion below; the applicant covers
the balance as in-kind co-investment, consisting of the existing MIT-licensed
codebase, specification, three implementations, conformance suite, Daml package and
verifier, already built and public before this proposal, and continued maintenance.

### Payment Breakdown by Milestone

- Milestone 1 *(Specification hardening)*: 75,000 CC upon committee acceptance
- Milestone 2 *(Mandate library and independent review)*: 75,000 CC upon committee acceptance
- Milestone 3 *(Integration into two existing Canton rails)*: 75,000 CC upon committee acceptance
- Milestone 4 *(Running in production, and handover)*: 75,000 CC upon final release and acceptance

Milestones 3 and 4 are accepted on integration rather than adoption: two merged
pull requests in repositories the applicant does not own, each producing records
that pass the conformance suite, named and openable by anyone. Nothing is paid
for a milestone that is not delivered, which is what the structure above already
means. The distinction matters. This is an evidence layer, not a platform, and
nobody adopts a layer. They merge it into a rail they already run, and the
applicant can go and write that pull request rather than wait to be chosen.

The independent Daml review in Milestone 2 is a third-party cost and is quoted inside
the Milestone 2 figure rather than as a separate line, so the committee is asked to
approve one number.

### Volatility Stipulation

Project duration is **under 6 months**. Should the timeline extend beyond six months
due to Committee-requested scope changes, any remaining milestones must be
renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the applicant will collaborate with the Foundation on:

- Announcement coordination
- A technical write-up on producing compliance evidence under a privacy-preserving
  ledger model, including what the approach does **not** prove
- Developer promotion through the Canton Developer Hub and the relevant SIGs

Specific commitment: the applicant will publish the failure cases as prominently as
the successes, including any conformance vector that exists because an earlier
version of this work was wrong.

---

## Motivation

**Who benefits.** Any Canton participant that has to demonstrate its own conduct to
a party that does not already trust it. That is a broad class, validators, app
providers, custodians, and any application acting on a client's behalf, but the
honest estimate is narrower than "all of them", because most applications today have
no external party demanding evidence. The immediate beneficiaries are applications in
regulated workflows and those operating autonomous or delegated execution, where the
question "what did it try, and what stopped it" is asked by someone external.

The Foundation's own roadmap states an expectation of **multiple grants** in this
area, which suggests the committee's estimate of the need is not smaller than the
applicant's.

**The originating case, stated plainly because it is evidence the problem is real
rather than a marketing story.** This work comes from an over-the-counter and
remittance desk in Nigeria that lost money to two specific failures: a payout account
substituted after a quote was agreed, and a single quote paid twice. Neither was a
broken cryptographic primitive. Both were authorisation decisions that nobody could
prove afterwards. Both are now fenced in the Daml and have named attack scripts.
Small operational businesses are where this evidence gap costs money first, and
Canton already has a live precedent at that scale, DSRV's deployment of ITCEN
Group's payment application inside a KOSDAQ-listed company's existing systems.

**Existing evidence of demand is thin and is presented as such.** The format is
installable today as `pip install knowyouragenticai-receipts` (1.0.0, MIT, zero
dependencies, published 6 September 2026) and verifiable in a browser with nothing
installed at all -- so the barrier to trying it is as low as it can be made. That
is a *distribution* fact, not an adoption one, and the two should not be confused.

The honest position: the format has three implementations and the applicant
wrote all three. Nobody outside is running it yet. The applicant's prior
published tooling has 2,471 total PyPI downloads with 880 in the last thirty
days, a figure that includes CI and mirror traffic and should not be read as
2,471 people.

That is precisely why Milestones 3 and 4 are accepted on integration rather
than on effort, and on integration rather than on adoption. Waiting to be
adopted is waiting to be chosen, and a layer nobody has heard of does not get
chosen. Writing the pull request is work the applicant can start on Monday,
and a merged one is a fact the committee can open and read rather than a
number it has to believe.

---

## Rationale

**Why extend rather than replace.** The default is to extend what exists, and this
proposal does. It does not replace the Foundation's static-analysis tooling, which
operates on source before deployment. It does not replace participant-side monitoring
such as Hacken's Canton Monitor, which observes at an operator's own trust boundary
and reports to that operator. It sits below both: the artefact an operator hands to
someone who does not trust them. Where an existing component could carry this, it
should, Milestone 1 includes checking whether the record format is better published
as an extension to an existing standard than as a new one, and the answer being "yes"
is an acceptable outcome of that milestone.

**Why a hash chain and not zero-knowledge proofs.** RFP 11 lists ZK proofs of
aggregate data as the most trustworthy end of the public-verifiability spectrum, and
that is correct. This proposal deliberately sits at the simple end. A hash chain
verifiable in a browser with no dependencies is adoptable this quarter by a desk with
one laptop; a proving system is not. The two are complementary, and the format is
designed so that the anchoring step could later be replaced by a stronger proof
without changing the record.

**Why refusals specifically.** Approvals leave ledger artefacts. Refusals do not,
which is why they are the part of an audit trail that is easiest to omit and hardest
to challenge. A format that records only what succeeded would be cheaper to build and
would not answer the question anyone actually asks.

**Why this applicant.** The work is already built, public and MIT-licensed, and every
number above is reproducible from a clean clone by a reviewer. The applicant is an
individual, not an organisation, which is a real risk to the committee, Milestone 4
requires a named second maintainer with commit rights precisely because that risk
should be retired inside the grant rather than after it.

---

**Verification.** Every quantitative claim in this proposal was re-run on 2026-09-06
and can be reproduced from a clean clone of
`https://github.com/dominicrume/cantor8_kya_rails` (MIT). The applicant will provide
the exact command for any figure on request, and undertakes to correct any figure
shown to be wrong.
