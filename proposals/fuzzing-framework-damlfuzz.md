## Development Fund Proposal: DamlFuzz

**Author:** Martin Derka, Head of New Initiatives at Quantstamp, on behalf of Quantstamp
**Status:** Submitted
**Created:** 2026-03-05
**Label:** daml-tooling
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** @monsieurleberre (Matthieu Le Berre)

---

## Abstract

We propose developing a fuzzer for Daml smart contracts.

Unit testing of Daml code relies on developers writing specific scenarios in Daml Script and asserting expected outcomes. There is no way to automatically generate random sequences of ledger operations, no way to define system-wide invariants, and no way to explore the contract state space beyond the scenarios a developer manually anticipates. Developers are used to tooling that is mature and readily available for languages and development frameworks in other ecosystems (c.f. the Foundry tools for Ethereum), and its absence provides an inferior experience for developers of applications on Canton Network.

The fuzzing tool will provision a property-based testing and the first coverage-guided fuzzing framework for Daml smart contracts while being designed from the ground up for Daml's unique authorization model, UTXO-like state, and multi-party privacy semantics. It will be developed as open-source, free to use, executable locally, will integrate with the current Daml tooling, and will provide reports usable in CI/CD pipelines.

---

## Specification

### 1. Objective

**Problem:** The Daml Standard Library has no random value generation, no `Arbitrary` typeclass, no generator combinators, and no shrinking infrastructure. Daml Script provides only deterministic, manually-authored scenario tests. This means:

- Developers only test scenarios they explicitly think of.
- Edge cases in authorization logic (e.g., what happens when a party is both signatory and observer?) go unexplored.
- Complex multi-step workflows (e.g., DVP settlement with partial allocations, deadline expiry, and concurrent exercises) are tested with at most a handful of scenarios.
- The interactions between CIPs (e.g., CIP-0078 fee removal affecting CIP-0047 reward generation) are never systematically tested.
- CIP-0013 (the re-onboarding minting bug) is a real example of a bug that would have been caught by invariant testing - the invariant "no SV mints more than their agreed share" was violated, but no test checked it under all possible re-onboarding sequences.

The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents.

**Intended Outcome:** Canton Network application developers will receive an easy-to-use fuzzing framework where they can:

1. Define invariants ("the total token supply never changes during transfers").
2. Run automated fuzzing campaigns that generate random sequences of ledger operations.
3. Get minimal failing sequences when an invariant is violated.
4. Use coverage feedback to guide exploration toward untested code paths.

### 2. Implementation Mechanics

_Note: A fuzzing tool for Daml was proposed independently in [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) on July 20, 2026 by @fronow. It includes an implemented PoC taking a complementary approach: an external driver fuzzing a live participant over the JSON Ledger API. This proposal centres on a Daml-native workflow inside `dpm test`. The two teams agreed to join efforts to deliver a production-grade tool with committed long-term maintenance, and this proposal has been adjusted accordingly._

We propose DamlFuzz as a **Daml Script extension** with a companion Haskell library. The design will follow the proven architecture of invariant testing tools that developers are used to from the Ethereum ecosystem, adapted for Daml's unique execution model. The work will focus on three main components:

**Component 1 - Generator Framework (`DamlFuzz.Gen`):**

The foundation will be a generator library providing:
- `Gen a` monad for building random value generators
- Built-in generators for all Daml primitive types: `Int`, `Decimal`, `Text`, `Bool`, `Date`, `Time`, `Party`, `ContractId`
- Combinators: `oneOf`, `frequency`, `listOf`, `mapOf`, `optional`, `suchThat`, `resize`, `scale`
- Automatic derivation via code generation from compiled Daml-LF: DamlFuzz reads a project's .dar, decodes its Daml-LF packages, and emits Daml source providing `Arbitrary` instances for every user-defined data type and template, together with signatory and controller accessor functions consumed by the engine's actor derivation.
- Shrinking: When a failing input is found, DamlFuzz will systematically reduce it to a minimal reproducer.

The key technical challenge is that Daml has no `IO` monad and no `System.Random`. DamlFuzz will solve this by providing a **deterministic PRNG** implemented in pure Daml using `Int` arithmetic. The seed will be supplied externally via the test runner (Haskell side), making tests reproducible.

The daml-fuzz-canton PoC (built independently by @fronow, submitted as [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579), now merged into this effort) validates the reproducibility architecture in practice: it generates transaction plans from an externally supplied deterministic seed. It does so host-side, because its executor drives the ledger from outside over the JSON Ledger API. DamlFuzz adopts the same seed-in, deterministic-out contract and reuses the PoC's generator design and validation methodology as the reference implementation. The implemented generator will be validated against the shared algorithm using common cross-validation vectors. The implemented PRNG’s statistical quality will be verified against the reference algorithm using standard PRNG test suites. An in-Daml implementation remains necessary because campaigns on the primary workflow execute inside Daml Script via `dpm test`, where generators are typed against choice signatures, can invoke user-defined Daml functions and constraints, and run at in-process speed. Those are capabilities that host-side generation cannot provide.

**Component 2 - Property Definition DSL (`DamlFuzz.Property`):**

Developers will define properties using a domain-specific language at three levels, plus two Canton-specific classes of authorization and privacy properties:

*Function-level properties* (postconditions on individual choices):
```
-- "After a transfer, the sender's balance decreases by exactly the transfer amount"
prop_transfer_sender_balance : Property
prop_transfer_sender_balance = forAll genTransferArgs $ \(sender, receiver, amount) -> do
  holdingCid    <- setupHolding sender amount
  balanceBefore <- queryBalance sender
  submit sender $ exerciseCmd holdingCid Transfer with receiver, amount
  balanceAfter  <- queryBalance sender
  pure $ balanceAfter === balanceBefore - amount
```

*System-level invariants* (must hold after every operation in a sequence):
```
-- "Total token supply is conserved across all transfers"
invariant_supply_conservation : Invariant
invariant_supply_conservation = Invariant $ do
  holdings <- queryAll @Holding    -- requires the test setup's omniscient view
  let totalSupply = sum [h.amount | h <- holdings]
  totalSupply === expectedTotalSupply   -- expectedTotalSupply captured from campaign setup
```

System-level invariants aggregate state across the whole test ledger and rely on the omniscient vantage a `dpm test` setup provides---no single party holds such a view on a real Canton topology. The party-scoped invariants introduced below express the variants that remain checkable against a live participant.

*Stateful fuzzing campaigns* (random sequences of operations):
```
campaign_token_stress : Campaign
campaign_token_stress = Campaign
  { actions         = [Action "transfer" genTransferAction, Action "allocate" genAllocateAction, ...]
  , invariants      = [invariant_supply_conservation, invariant_no_negative_balances]
  , parties         = [alice, bob, charlie, bank]  -- party universe allocated for the campaign
  , actorMode       = Authorized       -- submitters derived from signatory/controller sets
  , adversarialRate = 0.1              -- fraction of steps submitted as deliberately unauthorized sets
  , depth = 50        -- max actions per sequence
  , runs = 1000       -- number of random sequences
  }
```

The parties field declares the campaign's party universe; the engine derives each action's actual submitters from the target contract's signatory and controller sets (see the fuzzing engine), with an optional adversarial fraction submitted as deliberately unauthorized sets per the authorization properties above.

The daml-fuzz-canton PoC proposed in [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) validates the system-level tier. It contains built-in conservation-of-value and non-negativity checks. Both carry into DamlFuzz's built-in invariant library and will be extended into the CIP-0056 property pack in Milestone 3. The PoC likewise validates the stateful campaign model (randomized multi-party sequences with configurable depth, run count, and action weighting), which DamlFuzz re-expresses as typed, user-authored campaign definitions rather than command-line configuration. The property language is the net-new core, part of Milestone 1, while the existing PoC provides the built-in set and lists custom invariants.

Daml's distinctive risk surface is who can act and who can see. The costly bugs are capability and disclosure bugs: a choice whose controllers are broader than intended, a delegation that leaks a capability, a workflow that discloses a contract to the wrong party. Fuzzers built for global-state platforms cannot express these properties. Per-party views and multi-party authorization exist only on Canton, making this class one of DamlFuzz's clearest differentiators. Therefore, the DSL adds two Canton-specific property classes:

*Authorization properties* invert the oracle: the engine deliberately submits actions as party sets that should not be able to perform them. A rejection means the authorization model is working. An acceptance is the finding, i.e., a gap between declared and intended authorization, shrunk to the minimal sequence and party set that demonstrates it.

```
-- "No party set excluding the owner can transfer the holding"
prop_only_owner_transfers : Property
prop_only_owner_transfers = forAll genHolding $ \(owner, holdingCid) ->
  forAllSubsets (excluding owner) $ \subset ->
    expectRejected $ submitAs subset $ exerciseCmd holdingCid Transfer with ...
```

*Privacy properties* are party-scoped invariants: they state what a given party may observe, evaluated against that party's view of the ledger rather than an omniscient one.

```
-- "An uninvolved party observes nothing"
invariant_bystander_blind : Invariant
invariant_bystander_blind = invariantAs bystander $ do
  visible <- queryVisible
  pure (null visible)

-- "No party ever observes a negative holding"
invariant_no_negative_visible : Invariant
invariant_no_negative_visible = forEachParty $ \p -> do
  holdings <- queryAs p @Holding
  pure $ all (\h -> h.amount >= 0.0) holdings
```

Party-scoped forms also stay meaningful outside the test runner. System-level invariants such as supply conservation need the omniscient view a `dpm test` setup provides; party-scoped invariants can be checked against a live participant, where visibility is per-party by construction.

Both classes are already validated in practice by the daml-fuzz-canton PoC: its `--auth-fuzz` mode and `--privacy` check implement fixed versions of them, and they account for two of the four property tiers in its mutation-testing validation. DamlFuzz generalizes these fixed checks into the user-definable forms above. The retained end-to-end backend remains their highest-fidelity executor, since it exercises the participant's real authorization and visibility enforcement.

**Component 3 - Fuzzing Engine (`DamlFuzz.Engine`):**

The engine will orchestrate fuzzing campaigns:

1. **Initialization:** Deploy contracts under test, set up initial state
2. **Sequence generation:** For each run, generate a random sequence of up to `depth` actions:
   - Select a random action type from the campaign's action list (weighted by `frequency`)
   - Determine the submitting parties from the target contract's signatory and controller sets, evaluated over the actual payload at run time, so sequences are authorized by construction; in adversarial mode, deliberately select party sets that should not be authorized
   - Record each submission's accept/reject outcome
   - Generate random arguments using the action's generator
   - Submit the action via Daml Script's `submit` / `trySubmit`
3. **Invariant checking:** After each successful action, evaluate all invariants. If any invariant returns `False`, record the failing sequence.
4. **Coverage guidance** (optional, enhanced by DamlCov): If DamlCov is available, after each action, check which new code paths were covered and prioritize action types and argument ranges that increase coverage. Coverage-guided fuzzing finds deeper bugs faster. DamlFuzz is fully functional without DamlCov. Coverage guidance is an enhancement, not a requirement.
5. **Shrinking:** When a violation is found, systematically reduce the sequence:
   - Remove actions that do not affect the violation
   - Shrink action arguments to smaller values
   - Verify the minimal sequence still reproduces the violation
   - Report the minimal failing sequence, and emit it as a replayable artifact (seed + symbolic plan)

The engine will run as a Haskell executable that invokes Daml Script programmatically, supplying seeds and coverage feedback from the outside, while the Daml code holds the PRNG state, generates the values, and performs the ledger operations. The engine reports the accepted-transaction ratio per campaign and per mode: in the default mode a high ratio indicates budget spent exercising contract logic; in adversarial mode rejections are the expected outcome and acceptances are findings.

The [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) PoC already runs this <generate, execute, check, shrink> loop against a live Canton participant. It remains in the project as the second execution backend (black box), which approximates actor derivation via Party-typed field introspection rather than payload evaluation. Three pieces carry over directly:
1. Campaigns use the PoC's symbolic plan format, so a seed plus a plan replays identically on either backend.
2. Invariants are evaluated after every accepted action, following the semantics the PoC validated by mutation testing.
3. PoC has functional sequence-level shrinking.

The remaining development items are shrinking argument values, not just sequence length, and coverage-guided generation. 

#### Interaction with Existing Daml Toolchain

| Daml Tool | Integration Point |
|-----------|-------------------|
| `dpm test` | DamlFuzz campaigns run via `dpm test` as standard Daml Script tests |
| Daml Script | DamlFuzz uses `submit`, `trySubmit`, `query`, `allocateParty` - all standard Daml Script APIs |
| `dpm build` | DamlFuzz is a `.dar` dependency added to `daml.yaml` |
| DPM | Installable via `dpm install` as a vendored `.dar` |
| JSON Ledger API v2 | The end-to-end backend drives any reachable participant (local sandbox or LocalNet) as a standard API client |

### 3. Architectural Alignment

The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents, yet the current tooling support for fuzzing in Daml is insufficient. Beyond the use during the SDL of every project building for Canton Network, we list several use cases where the tool is applicable to CIPs and projects that are of interest to the overall Canton ecosystem:

- **CIP-0056 (Token Standard):** This CIP could benefit from a reusable library that includes pre-built invariants such as supply conservation, non-negative balances, transfer atomicity, and allocation lock exclusivity. Any project implementing CIP-0056 tokens will inherit these properties by adding DamlFuzz as a dependency.
- **CIP-0112 (Token Standard V2):** This is an evolution of CIP-0056 extending the interface. The properties for CIP-0112 will include the core CIP-0056 invariants, extended them with additional property targets introduced in this CIP. 
- **CIP-0104 (Traffic-Based App Rewards):** The complex traffic attribution formula is a good fuzzing target - integer overflow, multi-app splitting fairness, and coupon threshold semantics can all be expressed as invariants and stress-tested with random traffic patterns.
- **CIP-0013 (Re-onboarding Bug):** One could write a property that would have caught this bug ("SV minting never exceeds agreed share after any sequence of onboarding/removal/re-onboarding").
- **CIP-0105 (SV Locking):** Tier determination and vesting calculations under random lock/unlock sequences are natural fuzzing targets.

### Named Ecosystem Adopters
This section lists the ecosystem adopters who expressed interest in adopting and using DamlFuzz. It will be periodically updated as we gather additional support.

- Quantstamp (audit provider): DamlFuzz will be used to discover invariant violations in client audits.
- Coinversa.ai (project on Canton): DamlFuzz will be used to strengthen the test suite.
- Bitsafe: would [love better tooling](https://github.com/canton-foundation/canton-dev-fund/pull/323#issuecomment-4798960139) around security, static analysis and test-coverage of Daml, and would integrate the tool into their development workflow
- Audit provider no. 1 (name available upon request): DamlFuzz will be used during audit engagements
- Audit provider no. 2 (name available upon request): "If there is fuzzer, our guys will use it"
- Moonsong Labs: "[We’d like to see this built](https://github.com/canton-foundation/canton-dev-fund/pull/52#issuecomment-5179772350), and the proposal aligns with our technical expectations for this type of tooling"

An independent proposal for a similar tool in [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579), including the referenced defects in the CIP-0056 implementation, is an additional indicator that there is demand for a fuzzer for Daml, and that it will benefit the security of the ecosystem. _Note: The two teams agreed to join efforts to deliver a production-grade tool with committed long-term maintenance, and this proposal has been adjusted accordingly._


### 4. Backward Compatibility

No backward compatibility impact. DamlFuzz will be a library (`.dar` package), a companion Haskell executable, and a standalone end-to-end backend executable. All components use only public, stable interfaces. This includes the Daml Script APIs and Daml-LF format for the native path, and the JSON Ledger API v2 for the end-to-end backend. None modifies the Daml compiler, SDK, or Canton node software. Projects will opt in by adding DamlFuzz as a test dependency.

---

## Milestones and Deliverables

### Milestone 1: DamlFuzz: Generator Framework and Property DSL
- **Estimated Delivery:** 14 weeks after commencement of the grant
- **Focus:** Core `Gen` monad, PRNG, combinators, function-, system-, and party-scoped property definition, automatic derivation tool
- **Deliverables / Value Metrics:**
  - `DamlFuzz.Gen` library with generators for all Daml primitives + combinators
  - `DamlFuzz.Property` DSL for function-level, system-level, and party-scoped properties
  - `damlfuzz-derive` code generator producing `Arbitrary` instances from `.dar` files, including variant and enum constructor arguments
  - Deterministic PRNG in pure Daml, behaviourally equivalent to the PoC's reference generator as verified by shared cross-validation vectors, with statistical quality validated against standard PRNG test suites

### Milestone 2: DamlFuzz: Fuzzing Engine with Shrinking
- **Estimated Delivery:** 8 weeks after the committee acceptance of the prior milestone
- **Focus:** Campaign orchestration, sequence generation, actor derivation, invariant checking, shrinking, end-to-end backend integration
- **Deliverables / Value Metrics:**
  - `DamlFuzz.Engine` supporting stateful fuzzing campaigns with configurable depth and runs
  - Actor derivation from signatory and controller sets, with an optional adversarial submission mode and accepted-transaction ratio reported per mode
  - Shrinking that reduces failing sequences to minimal, verified reproducers, emitted as replayable artifacts (seed + symbolic plan)
  - The end-to-end backend (the retained [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) daml-fuzz-canton driver) integrated under the DamlFuzz umbrella, with a written, versioned plan-format specification and campaign-to-plan lowering, so the same campaign replays on either execution path
  - Engine validated against the [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) PoC's mutation-testing corpus, matching its detection record (8/8 planted defects, zero false positives)
  - Distribution both as (a) native binaries; and (b) a container image bundling the SDK components and a pinned OpenJDK, supporting one-command runs against a `.dar` and CI gates, for either the zero-config or the custom-campaign workflow
  - Comprehensive documentation and contributor guide
  - Performance benchmark per execution path (accepted transactions per second and accepted-transaction ratio), on a documented reference configuration, measured against the [PR#579](https://github.com/canton-foundation/canton-dev-fund/pull/579) PoC's published baseline

### Milestone 3: DamlFuzz: Benchmarking, Optimization and Standardized Applications
- **Estimated Delivery:** 12 weeks after the committee acceptance of the prior milestone
- **Focus:** Pre-built properties for CIP standards, coverage-guided exploration, ecosystem usability validation
- **Deliverables / Value Metrics:**
  - Performance optimizations and new benchmarks
  - Coverage guided exploration integrated into the fuzzing engine with demonstrated improvements over plain property-based testing
  - Pre-built properties for selected CIP standards including CIP-0056 and CIP-0112, validated against the PoC's CIP-0056 findings and planted-defect corpus
  - Published examples, tutorials, and case studies, including the use of (a) pre-built properties; (b) user-defined invariants; (c) party-scoped invariant validation against a live participant; and (d) integration guides for the use within CI 

### Milestone 4: Ongoing Maintenance
- **Estimated Delivery:** Ongoing for 12 months after the committee acceptance of Milestone 3
- **Focus:** The team commits to maintaining the tool and providing developer support for 12 months following the committee acceptance of Milestone 3. The code will be maintained as an open-source project during the entire duration. The team is interested in providing long-term support for the tool even after the initial commitment window elapses. In laymen terms, the team will ensure that the tool is ready and safe to use out of the box, actively maintain the repository during this period, and provide developer support for the ecosystem. This will include:
  - Bugfixes
  - Security updates - critical with the dependency supply chain attack 
  - Canton SDK compatibility
  - Major platform compatibility
  - Github ticket responses and developer support
  - Feature request triage
  - Additional feature development as feasible

Note that DamlFuzz will continue being usable even after funding period. The proposed tool is a standalone library and executable on top of stable Daml Script APIs and Daml-LF protobuf, so it will continue to work against any Daml version that does not break Script API contracts. All materials including `.dars` and tutorials will remain published, and the repository will remain open for community PRs and open-source development. The implementers are interested in ongoing maintenance of the tool beyond the indicated period.

- **Deliverables / Value Metrics:**
  - Ongoing maintenance of the project
  - Number of (un)resolved developer support tickets in Github

### Milestone 5: Ecosystem Adoption
- **Estimated Delivery:** Ongoing for 12 months after the committee acceptance of Milestone 3
- **Focus:** The team will focus on supporting ecosystem projects and other ecosystem participants in integrating DamlFuzz to improve the security posture of their code. This is an event-based milestone that aligns the grant and the proposed tool with the ecosystem adoption. We request 100,000 CC/project adopting DamlFuzz. The events will count within the first 12 months of the tool becoming usable, and the payouts will be limited to such 10 events (that is 1,000,000 CC milestone cap).

  An adoption event is credited only to an entity other than Quantstamp. Use of DamlFuzz by Quantstamp's own team in the course of an audit engagement is internal use and does not satisfy this milestone.

  An adoption event occurs in either of the following cases:
    1. **Integration by a project.** DamlFuzz campaigns or DamlFuzz-based tests are merged into the project's own codebase (e.g., for regression testing or CI), regardless of whether they were originally authored by the project team, by Quantstamp, or by another auditor in the course of an engagement. The adopting entity is the project. *Validation:* the merged content in the project's repository, together with the project's confirmation reported directly to the Tech & Ops Committee.
    2. **Use by an independent auditor.** An auditing firm other than Quantstamp uses DamlFuzz in an audit engagement. The adopting entity is that firm. *Validation:* the firm's audit report documenting the use of DamlFuzz.

  Where tests authored during an audit engagement are subsequently merged by the audited project, the event is attributed to the project under (i). Each adopting entity is counted at most once toward the milestone cap. Letters of intent may support evaluation of the grant proposal, but do not satisfy adoption milestones.
  
- **Deliverables / Value Metrics:**
  - Number of projects adopting DamlFuzz
---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Additional project-specific acceptance conditions:

- DamlFuzz correctly generates random Daml values for all primitive types and user-defined data types
- Property-based tests can be defined and executed via standard `dpm test` workflow
- Stateful fuzzing campaigns generate valid sequences of ledger operations with submitting parties derived from signatory and controller sets, reporting the accepted-transaction ratio per campaign
- Shrinking produces minimal failing sequences (demonstrated on synthetic bugs)
- Performance is sufficient for practical fuzzing campaigns: each execution path sustains at least 5 accepted transactions per second in the default (authorized) campaign mode, at steady state after warmup, against a single-participant local sandbox on the benchmark's documented reference configuration, with actual throughput per path documented in the Milestone 2 benchmark

---

## Funding

**Total Funding Request: 2,450,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 (Generator Framework and Property DSL): 500,000 CC upon committee acceptance and release
- Milestone 2 (Fuzzing Engine with Shrinking): 500,000 CC upon committee acceptance and release
- Milestone 3 (Benchmarking, Optimization and Standardized Applications): 150,000 CC upon committee acceptance and release
- Milestone 4 (Ongoing Maintenance): 25,000 CC/month, paid for the first 12 months after the committee acceptance of Milestone 3
- Milestone 5 (Ecosystem Adoption): an event-based milestone to demonstrate ecosystem alignment; 100,000 CC/project using the DamlFuzz, as evidenced and attributed as per the Milestone 5 definition, within 12 months adoption window after the committee acceptance of Milestone 3, capped at 1,000,000 CC (10 payable events)


### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion
- Hands-on technical workshops focused on using the tool

---

## Go-to-Market Strategy

DamlFuzz will be released as an open-source, freely available tool. The strategy for driving adoption is built around Quantstamp's existing position within the Canton security and audit community and does not depend on paid promotion or platform exclusivity.

**Distribution**

The tool will be published to a public GitHub repository under an open-source license and made available via DPM as an installable package (`dpm install damlfuzz`). All source code, documentation, and release artifacts will be freely accessible from day one.

**Tutorial-Driven Onboarding**

Step-by-step tutorials will be published covering: writing a first DamlFuzz property, and integrating the tool into a CI/CD pipeline. Tutorials will be written against real Canton Network packages (Daml Finance, Splice reference implementations) to ensure developers encounter immediately applicable examples. Tutorials will be submitted for inclusion in the official Digital Asset documentation and Canton Network developer hub.

**Audit-Integrated Recommendation**

Quantstamp conducts security audits of Daml and Canton Network applications. DamlFuzz will be recommended as a standard part of every Daml audit engagement: DamlFuzz will be used to demonstrate invariant violations where applicable. This gives the tool immediate credibility through use in real security contexts and ensures every project that undergoes a Quantstamp audit is exposed to the tooling.

**Community Evangelism**

Quantstamp will evangelize the tool through the Canton Network security community via developer forums, ecosystem calls, and technical meetups. Canton Network security experts are the natural early adopters: once they incorporate fuzzing into their standard workflow, they raise the baseline expectation for every project they review, contribute to, or audit. The goal is for DamlFuzz to become an expected artifact of serious Daml development - the way `forge fuzz` is expected in serious Solidity development.

**Definition of Success**

The primary success metric is adoption: Daml developers are routinely performing fuzz testing as part of their standard development and pre-deployment process, and the security posture of Canton Network applications improves as a result. The secondary metric is ecosystem position: when a Daml developer wants to fuzz-test a contract, DamlFuzz is the first solution they reach for. A concrete marker of success is that DamlFuzz appears in the testing sections of community audit checklists, CIP security guidance, and onboarding documentation for Canton Network developers.

---

## Motivation

Today, Daml developers ship contracts with structurally inadequate test assurance. There is no random input generation, no invariant checking, no way to ask "does this property hold for all possible sequences of operations?" This gap is not hypothetical. CIP-0013, the re-onboarding minting bug, is a documented instance of exactly the kind of invariant violation - "an SV never mints more than its agreed share" - that systematic fuzzing would have surfaced before deployment.

Every major competing smart contract platform has addressed this gap. Foundry (`forge fuzz`) has become a foundational part of the Ethereum developer experience. Daml's absence from this category is conspicuous and is reflected in survey data: 75% of respondents to the 2026 Canton Developer Experience Survey rated security tooling as "Important" or "Critical," while the current tooling provides no automated adversarial testing.

The immediate beneficiaries are the developers building on Canton Network today - those implementing CIP-0056 token standards, building dApps under CIP-0103, or contributing to shared infrastructure like Daml Finance. The strategic beneficiary is the Canton Network itself: a platform that can credibly claim production-quality security tooling attracts more sophisticated builders and more institutional adopters. Developer tooling is infrastructure, and like all infrastructure, its absence is most visible when something breaks.

Notes: 
- Prior fuzzing work in other ecosystems validates the approach and the need, but is not reusable here---Daml's authorization model, UTXO-like state, and multi-party privacy semantics require a redesign. The funding covers the Daml-specific engineering.
- We received verbal confirmation that there is no overlapping work at Digital Assets. 

---

## Rationale

The proposed tooling exists in many mature ecosystems. The proposal follows the established use cases and patterns. The team has rich experience with developing similar tools, and formulated the roadmap based on their experience.

---

## Appendix: Responses to Reviews

In response to the [review](https://github.com/canton-foundation/canton-dev-fund/pull/52#issuecomment-4128467271):

### 1. Evidence of ecosystem demand

Quantstamp has conducted multiple security audits of Daml and Canton Network applications. In each engagement, the absence of automated invariant testing is a recurring friction point, both for our auditors and for the development teams we work with. We regularly report untested code, and we regularly report untested edge cases to Canton Network projects being audited. Audited projects also often seek guidance regarding testing from auditors, which we are unable to provide due to the tooling absence. The 2026 Canton Developer Experience Survey cited in the proposal, where 75% of respondents rated this category of tooling as "Important" or "Critical". We can obtain further evidence through direct testimonials from Canton Network projects to the committee.

The proposed tool plays an important role for agentic development as well. It provides data that agents can use to reason about their code quality, guide to to finding mishandled logic, and delivering more reliable code. The use of AI tooling during development is increasingly popular, making the tool even more valuable ecosystem addition.

### 2. Scope and sequencing

The delivery sequence already ensures independent value at each stage. DamlFuzz is designed to be independently useful from Milestone 2 onward.

### 3. Adoption expectations

The team will consider the tool successful if it:

- Becomes universally recommended as a fuzzing tool by the Canton Network and Daml community.
- A vast majority of projects completing their development phase enters the audit phase with DamlFuzz configured in the codebase.
- Multiple auditing firms recommend the use of DamlFuzz when providing guidance to projects undergoing an audit.
- DamlFuzz is used in CIP implementations (e.g. in CIP-0056).
- Becomes regularly used by agents when developing DAML code.

### 4. Integration with existing workflows

DamlFuzz uses only standard Daml Script APIs. Campaigns are expressed in Daml Script and run via `dpm test`, so they appear in the same test execution workflow developers already use. Adding DamlFuzz to a project **only requires adding it as a test dependency** in `daml.yaml` and writing campaign definitions.

The tool will be executable locally, and its structured plain text output can be further used in CI/CD pipelines as is customary for other similar tools.
