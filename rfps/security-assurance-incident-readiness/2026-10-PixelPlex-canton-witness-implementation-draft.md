# Canton Witness: implementation draft

A per-role disclosure report for a Daml application's test scenarios, its diff between package versions, and a CI gate. Companion to the Development Fund proposal. PixelPlex, 2026-10-28.

Written against Daml SDK 3.5.2 via `dpm`, with the token standard read at Splice 0.9.4 (counts below are the same at 0.8.3). Appendix A has the minimal code and commands for the two findings the proposal rests on.

## 1. Goal and non-goals

**Goal.** For an application and the scenarios that exercise it, state which role received which contract through which channel and because of which node; compare that between two versions of a package; fail a build when it widens.

**Non-goals.** Any claim about a running deployment: this reads test runs, and every report says so. Deciding what an application ought to disclose. Formal verification. Measuring a package one does not own (§6). A visualizer or a Ledger API client, which #327 `dpm trace` provides. Hosting migration. Any change to Canton or to a measured application.

## 2. The two channels

Both are ways for a party to receive contract data while being neither signatory nor observer of that contract.

**Divulgence (`D`).** A party that is an informee of an exercise learns the contents of contracts fetched inside it. The shipped conformance suite states the intent: "Divulged contracts should not be exposed by the transaction service", and the same for immediate divulgence.
Source: `community/ledger-test-tool/.../suites/v2_2/DivulgenceIT.scala:17-19,161-163`.

**Witnessing a create (`W`).** A party that is an informee of an exercise sees a contract created inside it while not being its stakeholder.

**A less obvious case.** A choice observer on a non-consuming exercise also gets `D` on the contract the choice is exercised on. In Appendix A, bob is a choice observer on `Bridge`'s `Peek` and `Spawn` and receives `D` on `Bridge` itself, as well as `D` on `Secret` and `W` on `Child`.

**What "invisible to queries" means.** In Appendix A's scenario, `query`, `queryFilter`, `queryContractId` and `queryDisclosure` as bob return nothing for `Secret` and `Child`, while alice sees both. With an interface implemented by both templates, `queryInterface` and `queryInterfaceContractId` as bob return nothing too. That variant builds in one package only with `-Wupgrade-interfaces`, because by default the SDK rejects an interface and its implementing templates in the same package. Key-based forms do not apply at LF 2.1, which has no contract keys. The claim covers these party-scoped read forms of `Daml.Script` at 3.5.2 and the tools built on them. It does not cover the whole Ledger API: the ledger-effects transaction shape populates `witness_parties` with cumulative informees, so a witnessed create does reach a subscriber to that stream. That stream does not render fetch nodes, so divulgence stays invisible there.

**Rollbacks are not a separate channel here.** `dpm test` at 3.5.2 refuses a rollback containing a create or a consuming exercise (`EffectfulRollbackError: Tried to rollback side-effectful node(s)`). What can sit inside a rollback is a fetch or a non-consuming exercise, and a rolled-back fetch shows up as `D` like any other.

## 3. What the toolchain already provides

**The transaction tree.** `dpm test --transactions-output <dir>` writes, per scenario, a tree in which each contract carries its disclosure history and each fetch is a child of the exercise that performed it:

```
#0:0
│   disclosed to (since): 'alice-d4d95138' (0)
│   divulged to (since): 'bob-9b3970be' (2)
└─> 'alice-d4d95138' creates Main:Secret with payload = "SECRET"
#2:1
└─> 'alice-d4d95138' fetches #0:0 (Main:Secret)
```

**The matrix.** `--table-output <dir>` writes a contract-by-party table with one of four codes per cell:

| Code | Meaning |
| --- | --- |
| `S` | Signatory |
| `O` | Observer |
| `D` | Divulged |
| `W` | Witness: informee of the exercise, not a stakeholder of the contract created inside it |

Both are HTML for one test run. There is no machine-readable form, no comparison between runs and nothing a build can fail on.

## 4. The report

### 4.1 The object

One report per (application version, scenario):

- **Header.** Scenario identifier; name, version and hash of every DAR in the run; SDK and tool versions; a digest over the scenario source and its role map.
- **Rows.** One per contract instance: template, defining package hash, creating node, final status.
- **Cells.** One per (row, role): the code `S`, `O`, `D`, `W` or absent, and the **provenance**, the node that established it.

The SDK table has no provenance. The report adds it, so an engineer reads, for example, that bob receives this contract because of the fetch at `#2:1` inside `Peek` on `Bridge`.

### 4.2 Roles, not party identifiers

Party identifiers are deterministic per run but keyed to allocation order: inserting an earlier allocation renames every later party. A report keyed on identifiers would show everything as changed. Reports key on roles, resolved in this order:

1. **From the party-id hint, when it is unique in the run.** Shifting the allocation order changes only the suffix of a party id; the hint (`alice-…`) stays.
2. **From the scenario's own allocation, when the tool can read it**: a literal hint passed to a Daml Script allocation function (`allocateParty`, `allocatePartyWithHint`, `allocatePartyByHint`, and their `…On` variants) or to a wrapper the role map names. The shipped token-standard packages use `allocatePartyExact`, a helper in `Splice.Testing.Utils` defined as `allocatePartyByHint (PartyIdHint name)`, in about a dozen modules.
3. **From an explicit role map** next to the scenario, for parties allocated in a loop or from a bound variable, which the shipped pack also does.
4. **Otherwise the scenario is refused**, naming the allocation site.

Two identifiers resolving to one role are refused for the same reason: a role-keyed report would merge two parties' disclosure.

### 4.3 Matching rows between two reports

- **Key: (template, creating exercise, role).** A choice that creates in a loop produces several contracts of one template under one exercise. Such a group is compared with multiplicity: for each role, the multiset of codes across the group, and for each contract the set of roles holding each code. A recipient swapped between two members, two recipients exchanged, or a member's code changed each change one of those and are reported.
- **Create arguments refine the match** where they distinguish members and contain no party identifier or contract id.
- **Ambiguity is inconclusive.** If a group cannot be matched one-to-one after refinement and its multisets differ, the row is inconclusive. The gate fails on an inconclusive row unless it has an accept entry (§5).
- **Node ids are positional and are never keys.** Provenance is shown on both sides, but matching never uses it.
- **Changed scenario.** If the scenario digest differs between the two reports, the diff says so in the header and every row whose creating exercise moved is inconclusive.

## 5. The diff and the gate

**The diff.** Cell by cell over matched rows. An **addition** is a role holding a code where it held none, or a different code. **Removals** are reported too: narrowing may be a fix or a broken workflow, and the tool does not guess which. Each side carries its provenance. Changes to the scenario sources or to the role map are listed in a separate **inputs changed** section, apart from changes in the measured package.

**The gate.**
- The baseline is the report set built from the pull request's base commit (`github.event.pull_request.base.sha`) with the same tool version. A CI artifact keyed on that commit and tool version is only a cache, so a skipped or failed run on the protected branch does not move the baseline.
- On a pull request, CI produces the candidate reports and diffs them against the baseline.
- The build fails on any addition and on any inconclusive row. `--allow-inconclusive` exists for local use; the published GitHub Action does not expose it.
- A non-empty "inputs changed" section is shown first in the gate's output, so a reviewer sees that scenarios or the role map moved together with the code.
- An intended widening is accepted through `witness-accept.json`. An entry `(scenario, template, role, code, count)` accepts up to `count` additions of that code for that role on rows of that template in that scenario. The gate passes when every addition in the diff is covered.
- Inconclusive rows and added or removed scenarios are accepted the same way: an entry `(scenario, "inconclusive" | "scenario-added" | "scenario-removed")`. Rows of an added scenario are reported in full, so the reviewer sees what the new test discloses. Without an entry, the gate fails on all three.
- After the merge the new baseline already contains the accepted change, so the entry matches nothing. An unmatched entry gives a warning, not a failure, and does not block the next pull request. A scheduled workflow opens a pull request that removes such entries. Until it is merged, an unmatched entry could accept the same change again; the warning names it on every run. Changes to the file are listed under "inputs changed".
- On `pull_request` the workflow runs from the pull request's branch, so checks inside the Action are not a control. The protection is in the branch rules: CODEOWNERS covers `witness-accept.json`, the scenario paths, the role map, `.github/` and CODEOWNERS itself; the protected branch requires review from Code Owners and approval of the most recent push. The guide states these rules and rules out `pull_request_target`, which would run the base workflow against untrusted code with write access.
- The Action reads the branch's rulesets through `GET /repos/{owner}/{repo}/rules/branches/{branch}` and prints whether Code Owner review and latest-push approval are required. For classic branch protection, which a default token cannot read, the organization shows the setting to the Committee reviewer. That log line or that confirmation is the evidence for Milestone 4 condition 5.
- The gate stays a required check; accepting a change needs no admin bypass.

**The cases this is built for.** The main case is an application's own helper: a function that computes a stakeholder or observer list for several templates. A change to it moves who sees every contract built through it, and the template text does not change. The token standard shows the same pattern in public code, which is why its scenarios are the first corpus. The V2 test token shipped with the standard (`splice-test-token-v2`) declares its holding as `signatory accountParties holding.instrumentId.admin holding.account, holding.instrumentId.admin`, and `accountParties` lives in `splice-token-standard-utils`. If that helper changes and the template text does not, `upgrade-check` compares two identical expressions and reports nothing, both within one package and when the application is rebuilt against a new version of a helper package (Appendix A). The same helper fills `observers` of `EventLog_HoldingsChange`, a non-consuming choice with `observer observers`, so a change to it also moves who gets `D` on the event log. In a report, a role gains or loses a code on every row created through the edited helper, and the diff shows it with the template and the node on both sides.

**Template renames are out of scope.** Rows match on qualified template name. Within an upgrade line, `upgrade-check` rejects a rename, so the case only arises between unrelated builds.

## 6. Packages one does not own

This grant builds the tool for a team measuring its own application. What limits measuring someone else's:

- **Module export lists are not a limit.** Against `module V (Public(..)) where`, a probe that declares the DAR as a data dependency fails with `Not in scope: data constructor 'Hidden'`; with `--ignore-data-deps-visibility=yes`, in `build-options` or on the command line, it builds and the script creates `Hidden`. The flag has to be tested in a clean directory: a `.daml/` cache left by an earlier build without it makes it look ineffective.
- **Off-ledger backends.** A workflow that needs a choice context, a disclosed contract or another value computed off-ledger cannot be driven without reimplementing that part of the vendor's service. The shipped test packages simulate it for their own registries (`RegistryApiV2`, initializers of 560 and 371 lines); for any other registry that work would have to be repeated.

What does work: a package with no off-ledger inputs can be measured as a data dependency, and its templates resolve by package hash, verified against a package whose sources were deleted.

## 7. `dpm` component

- `dpm witness report [--scenarios <pkg>] [--role-map <file>] --out <dir>` runs `dpm test` with `--transactions-output` and `--table-output` and writes the reports.
- `dpm witness diff <baseline-dir> <candidate-dir>` writes the diff as JSON and Markdown.
- `dpm witness gate <baseline-dir> <candidate-dir> [--accept <file>]` exits non-zero on any addition, inconclusive row or scenario change the accept file does not cover, and warns on unmatched entries.
- A GitHub Action wraps `report` and `gate`, builds the baseline from the pull request's base commit (cached as an artifact keyed on commit and tool version), and prints the branch rules described in §5.
- The reader is also published as a library with the report schema, so `dpm trace` (#327) or another tool can consume reports rather than reparse HTML. The schema is a versioned JSON Schema in the repository. It belongs to the tool, so we do not propose it as a CIP.

The component follows DPM component conventions; it pins the SDK versions it supports and refuses an unsupported one.

## 8. What is not measured

Every report carries this list.

- **Onward transmission.** A party that witnessed a create holds `createdEventBlob` and can submit it as a disclosed contract for a choice it is already authorized to exercise; the shipped `EDDiscloseeUsesWitnessedContract` does this. What it does with the blob off-ledger is not a property of the application.
- **Participant-level exposure.** Reports are per party on the IDE ledger. Parties co-hosted with an informee, and the operator of its participant, see what the informee sees, and are not modelled. Milestone 1 checks the party-level result against a running ledger: a subset of the token-standard scenarios runs on a local `dpm sandbox`, and for each created contract the parties marked `S`, `O` or `W` are compared with `witness_parties` of its create event in the ledger-effects stream. Every mismatch is published with its explanation. `D` cannot be checked this way, since the event stream has no fetch events.
- **Off-ledger disclosure.** What a service returns to a caller is outside the ledger model.
- **Production traffic.** This reads test runs.
- **Anything the scenarios do not exercise.** A report is as complete as the scenarios behind it, and the header names them.

## 9. Upstream data source (Milestone 3)

The reader parses HTML behind one interface, with golden-file tests per supported SDK version and CI pinned to two. Milestone 3 replaces that dependency with a supported output in `digital-asset/daml`: `dpm test` writes the same tree and matrix as JSON next to the HTML, as requested in [digital-asset/daml#16371](https://github.com/digital-asset/daml/issues/16371) (open since 2023-02-22). The data is already in `damlc`; only the serialization is missing. The JSON carries per node the `disclosed to` and `divulged to` parties and the fetch nodes, and per contract and party the code. The schema is published with the pull request. We open the issue for the design in week 1 of Milestone 1.

**Not in this grant: disclosure information in Daml Script.** A DA reviewer on #124 suggested that `submitResultAndTree` return informees, divulged-to parties and witnesses per node, so teams could assert on `D` and `W` directly in Daml Script. Daml Script's `TransactionTree` at 3.5.2 has only created and exercised events, and divulgence happens at a fetch, so fetch nodes would have to be added. Against a participant, Daml Script reads the Ledger API, whose event stream has no fetch events either, so the divulgence part could be filled in only on the IDE ledger. If the maintainers want this, the JSON output is the base for it, and it would be proposed separately (§11).

Separately, Milestone 3 proposes a patch to `upgrade-check`: compare the definitions that a signatory, observer or choice-observer expression refers to, including across a dependency's versions, and report a difference under its own warning name. It is opened as an issue in week 1 of Milestone 1, so the maintainers can take it themselves. The design is in §9.1.

Payment is on merge, and each part only if its pull request is merged by month 9 or by a later date the Committee sets at the Milestone 2 review. After that the reader switches to the new output once an SDK release contains it, and this is maintenance work if the release comes after month 9. If the JSON output is declined, or the maintainers implement it themselves, the data-source part (85,000 CC) is not paid and the HTML reader remains, with its golden files.

### 9.1 The `upgrade-check` patch

**What is compared.** For each template in both packages: the signatory and observer expressions, and for each choice the controller and choice-observer expressions. Today `upgrade-check` compares these expressions themselves. The patch also collects, from each expression, the top-level value definitions it refers to, transitively, including definitions in dependency packages. For each such definition it compares the two bodies with the same structural comparison `upgrade-check` already uses. A difference gives one warning that names the template or choice, the expression and the path of references to the changed definition.

**What is not followed.** Type class methods are followed only when the instance is resolved statically in the expression; otherwise the warning is not raised and the expression is reported as not analysed, in the same way `could-not-extract-upgraded-expression` works today. Definitions whose type cannot contain a `Party` are not followed. A definition is compared once, however many expressions refer to it.

**Noise.** Any change to a helper on the path warns, including a refactor that keeps the result, and the patch cannot tell the two apart statically. That is why it is a warning with its own name, and why the gate relies on the dynamic diff. Before the pull request is opened we run the patch on pairs of consecutive Splice releases and publish the number of warnings and how many of them change a party set. If the maintainers find the count too high, the warning ships off by default.

## 10. Validation corpus

Published with Milestone 1. The Milestone 1 feasibility gate is that this corpus passes.

- **Known-answer scenarios**, one per code `S`, `O`, `D`, `W`, plus Appendix A's scenario, with the expected report written by hand from the Daml.
- **Mutations the diff must report**, each as a pair of package versions with one scenario:
  - a recipient swapped between two members of a same-template group;
  - two recipients exchanged across roles;
  - a fetch added inside a choice with a wider audience (new `D`);
  - a create moved under an exercise with an extra choice observer (new `W`);
  - a choice observer added on a non-consuming choice (new `D` on the exercised contract);
  - observer logic moved into a helper, then the helper changed (Appendix A, part 1).
- **Refusals**: an unresolvable allocation site, a duplicate role, an unsupported SDK version. Each must fail with its reason named.
- **No silent pass**: a group that cannot be matched one-to-one must come out inconclusive, and the gate must fail on it.
- **Determinism**: two runs of one scenario produce identical reports; a run after an unrelated package-version bump differs only in the header.
- **The query comparison**, kept as a permanent test: the party-scoped read forms, including the interface forms, return nothing where the report shows `D` or `W`.

## 11. Open questions for the SIG

1. Which JSON format the Daml maintainers prefer for the test output (§9), and whether they want the `upgrade-check` patch from us or prefer to make it.
2. Whether the maintainers want disclosure information in Daml Script's `submitResultAndTree` on top of the JSON output, given that a participant cannot supply fetch nodes (§9).
3. Should `D` be observable outside test runs? Nothing supported exposes divulgence today. This is a platform question for the SIG.

## 12. Deliberate limits

- **Test runs, not production.** §1, §8.
- **Two channels, not three.** Rollbacks are covered by `D`. §2.
- **Own packages only, by scope.** Off-ledger inputs limit third-party measurement; export lists do not. §6.
- **No policy.** The tool never says a disclosure is wrong. It reports what was disclosed and gates on change.
- **Ambiguous groups fail the gate.** The tool does not guess a match. §4.3.
- **No template renames.** §5.

## 13. Risks

| Risk | Mitigation |
| --- | --- |
| The SDK changes its HTML and the reader breaks | golden files per supported SDK, CI pinned to two; Milestone 3 removes the dependency if merged |
| The JSON output is declined, or a pull request is not merged by the deadline | the data-source part of Milestone 3 (85,000 CC), or the unmerged part, is not paid; the HTML reader stays maintained |
| `upgrade-check` closes the helper gap (our patch or DA's own) | intended; the diff and gate still cover `D` and `W`, which no static check sees |
| Some token-standard scenarios cannot be role-resolved | they are listed with the reason, and the role map covers loop allocations |
| Inconclusive rows make the gate noisy | each is reported with the group and the reason; refinement by create arguments reduces them; a reviewed accept entry clears one without disabling the gate |
| The `upgrade-check` patch is rejected as noisy | it has its own warning name and can ship off by default; the warning count on Splice releases is published with the pull request (§9.1); its share (35,000 CC) is paid only on merge |
| No independent adopter appears | 57% of the request is paid only per adopting organization |

## Appendix A. Reproduction

SDK 3.5.2, `dpm`, `build-options: [--target=2.1]`.

**1. The `upgrade-check` blind spot.** Package `wit-helper`, versions 1.0.1 and 1.0.2, same template:

```daml
module Main where

template T
  with owner : Party; other : Party
  where
    signatory owner
    observer obs this

obs : T -> [Party]
obs _ = []          -- 1.0.2: obs t = [t.other]
```

```
dpm build -o v1.dar     # in each package directory
dpm upgrade-check --compiler v1.dar v2.dar ; echo $?
```

No output, exit 0. A control pair that changes `observer ([] : [Party])` to `observer [other]` in the template prints `warning … Expression is structurally different` and also exits 0.

**2. `D` and `W`, invisible to queries.**

```daml
import Daml.Script
import DA.Optional (isNone)

template Secret with owner : Party; payload : Text where signatory owner
template Child  with owner : Party where signatory owner

template Bridge
  with owner : Party; peer : Party
  where
    signatory owner
    nonconsuming choice Peek : Text
      with cid : ContractId Secret
      observer peer
      controller owner
      do (.payload) <$> fetch cid
    nonconsuming choice Spawn : ContractId Child
      observer peer
      controller owner
      do create Child with owner

channels : Script ()
channels = do
  alice <- allocateParty "alice"
  bob <- allocateParty "bob"
  s <- submit alice $ createCmd Secret with owner = alice; payload = "SECRET"
  b <- submit alice $ createCmd Bridge with owner = alice; peer = bob
  submit alice $ exerciseCmd b Peek with cid = s
  c <- submit alice $ exerciseCmd b Spawn
  bobSecrets <- query @Secret bob
  bobChildren <- query @Child bob
  bobS <- queryContractId bob s
  bobC <- queryContractId bob c
  bobF <- queryFilter @Secret bob (const True)
  bobD <- queryDisclosure bob s
  assertMsg "bob queries nothing"
    (null bobSecrets && null bobChildren && isNone bobS && isNone bobC && null bobF && isNone bobD)
```

```
dpm test --table-output tbl --transactions-output tx
```

The script passes. `tbl/table-channels.html`: `Secret` bob `D Divulged`; `Child` bob `W Witness`; `Bridge` bob `D Divulged`. `tx/transaction-channels.html`: `divulged to (since): 'bob-…' (2)` on `Secret`.

**3. The helper in a separate package.** Package `wit-utils` 1.0.1 has `obsOf _ = []`, 1.0.2 has `obsOf p = [p]`. Package `wit-app` 1.0.1 and 1.0.2 have the same template, `observer obsOf other`, and differ only in which `wit-utils` DAR they take as a data dependency. `dpm upgrade-check --compiler a1.dar a2.dar` prints nothing and exits 0; `--both` reports that typechecking the upgrade succeeded.
