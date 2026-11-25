# STL: Sandbox Testing Library

## Development Fund Proposal

**Organization:** CoBuilders  
**Author / Primary Contact:** Augusto Collerone, CoBuilders (@augustocollerone)  
**Status:** Submitted  
**Created:** 2026-11-16  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Developer Experience, Tooling & Education: RFP 18, Integration into SDLCs  
**Champion:** `Needs Champion`  
**Total Funding Request:** 400,000 CC  
**Project Duration:** 14 months: 8 weeks of development and application integration, then 12 months of maintenance and adoption follow-up  
**Label:** daml-tooling  

---

## Abstract

STL (Sandbox Testing Library) is an open-source npm package for JavaScript and TypeScript integration tests against the Canton Sandbox. It replaces the Sandbox setup and teardown code teams write for themselves; teams keep their own test runner, fixtures, and assertions.

The beta is on npm. It already starts and stops a Sandbox, creates fresh parties and users for each test, and runs unchanged OpenZeppelin contracts against a real Sandbox in public CI.

This grant funds the path from that prototype to a maintained npm package that adds authenticated submission and queries as those users, control of ledger time, lookup helpers, and compatibility tests for each Sandbox release. It also funds the adoption work: three migration pull requests against projects owned by independent teams, a case study for each migration, a recorded walkthrough of a real application's hand-written Sandbox setup being replaced with STL, and a Node.js testing tutorial for the Canton documentation.

The proposal answers RFP 18, Integration into SDLCs, of the Foundation's 2026–2028 roadmap.

## Motivation

**The problem.** When off-chain code needs the Ledger API in fast pull-request CI, teams test it against the Canton Sandbox. Each team then has to manage the test environment itself:

- Start the Sandbox, know when the Ledger API is ready, and avoid port clashes.
- Upload DARs and allocate parties and users.
- Control ledger time for expiry tests.
- Tear everything down so the next run starts clean.

Canton's [CI/CD guide](https://docs.canton.network/appdev/modules/m5-ci-cd-integration#backend-integration-tests) uses the Sandbox in its backend integration-test example, and its [testing guide](https://docs.canton.network/appdev/modules/m5-testing-strategies#test-isolation) recommends long-running instances with unique users and parties for each test run. The guidance exists. A maintained Node.js implementation of it does not, so each team writes, debugs, and maintains its own.

**External validation.** Before writing this proposal, we asked [Nenad](https://github.com/0xNeshi), who works on Canton at OpenZeppelin, how the team tests off-chain code and where setup costs the most. Nenad named three costs: process lifecycle, time control, and bringing the Sandbox up with the same contracts and data on every run. In full:

> Our tests run against a Canton ledger through a shared Bash library that exposes one interface over two backends. `dpm sandbox` is the default: it needs no container images and starts in seconds, so it runs on every pull request. Splice LocalNet, via Docker Compose, runs a participant on a real synchronizer with an authenticated Ledger API, so it is the backend we use to test authorization, party rights and package vetting.
>
> One of our harnesses drives the Canton wallet gateway from JavaScript, which is why we needed the Sandbox in the first place; in general, whenever we need the Ledger API and fast execution for pull-request CI, we use the Sandbox. JS/TS is our go-to for these tests: Daml Script handles on-ledger setup and assertions, plain Node.js runs the off-chain clients, and Bash handles orchestration.
>
> The most time-consuming parts of setting up and maintaining the Sandbox tests have been process lifecycle (knowing when the Sandbox is ready, whether the Ledger API port is free, and freeing ports on teardown), time control, and bringing the Sandbox up with the same contracts and data for multiple runs.

**Verifiable in public code.** The costs described above can be checked in public repositories. Two teams have each written their own script to start the Sandbox, wait until it is ready, and stop it:

OpenZeppelin's [public script](https://github.com/OpenZeppelin/canton-specs/blob/main/scripts/ledger.sh) is about 590 lines of Bash. It polls the Sandbox log for readiness, checks ports before starting, runs the process in its own group with SIGTERM then SIGKILL on teardown, and waits for ports to be released. It has no time control and no snapshots.

BootNode's public [`sandbox.sh`](https://github.com/BootNodeDev/canton-token-forge/blob/5b8a3e82fa2106a97624decdaa9ba364dd969c28/scripts/sandbox.sh) uses the same process-group teardown, because `dpm` does not forward signals to the Canton JVM. It adds its own pre-start port check and leaves the readiness wait to the caller.

Each of these harnesses is written, debugged, and maintained in isolation, with no shared place for a fix to land. That repeated, unshared lifecycle code is what this proposal replaces.

**Ecosystem economic impact.**  Nenad works on the OpenZeppelin [Canton Ecosystem Stack](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-OpenZeppelin-canton-ecosystem-stack.md), a 28.4M CC proposal approved on 2026-05-13 to deliver eight reference implementations and an audited Daml contracts library over 24 months. The time that team spends on Sandbox plumbing is time the Development Fund is already paying for, and the same is true of any other fund-supported team that tests against the Sandbox. Teams outside the Dev Fund carry the same cost and pay for it themselves. Investing in that work once, in a shared package, has a direct and tangible economic impact on the ecosystem, not a convenience benefit for one developer.

**Alignment with the Foundation's roadmap and developer survey.** RFP 18 in the Foundation's [2026–2028 roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#developer-experience-tooling--education) asks for tooling that brings Canton testing and CI into the workflows teams already use.

The Foundation's [2026 developer-experience survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) had 41 respondents. Of these, 41% named environment setup and node operations as the task that took longest to get right. Respondents also asked for a CLI that automates "testing/deployment pipelines without complex manual configuration". STL serves the testing half of that request from inside the test suite. The package also offers the Foundation's CI documentation a Node.js example next to the Java one.

## Objectives and Scope

STL aims to remove the Sandbox setup and maintenance that every team repeats on its own in JavaScript and TypeScript integration tests on Node.js. A team that needs this kind of testing then does not carry the cost of building and maintaining that setup, and its developers spend less time preparing and debugging the test environment, locally and in CI, and more time testing application behavior. Teams keep their application contracts, fixtures, test runner, and assertions.

What the grant covers:

- **In scope:** Sandbox startup and cleanup, DAR uploads, test parties and users, Ledger API access with those users' permissions, party and contract lookups, and static-time control.
- **Outside this grant:** LocalNet, remote participants, multi-participant orchestration, wallet and Splice services, and snapshot restore.

## Proposed Solution

### Solution Overview

Developers call STL's helpers from the setup hooks of Mocha or Node's test runner to prepare the Sandbox, act on the ledger, and clean up:

1. During setup, STL starts the Sandbox and uploads the application's DARs, once per suite or once per test, depending on the isolation needed.
2. Before each test, its helpers create fresh parties and users, and the application's own fixtures create the contracts that test needs.
3. Tests submit commands and read ledger data through clients bound to those users.
4. STL stops the Sandbox when the suite or test ends.

With the beta, a Node.js test looks like this:

```js
before(async () => {
  sandbox = await startSandbox({ dars: ["./.daml/dist/my-app-0.0.1.dar"], cantonVersion: "3.5.6" });
});
after(async () => { await sandbox?.stop(); });

it("a fresh party has an empty contract view", async () => {
  const { Alice } = await freshParties(sandbox, ["Alice"]);
  assert.deepEqual(await asParty(sandbox, Alice).contracts(), []);
});
```

The sample uses the beta's `startSandbox`; the beta also exports `withSandbox()`, the helper named throughout this proposal. The release keeps this shape and adds authenticated access with token providers, lookups, and `time`.

### Implementation

STL is written in TypeScript and calls the JSON Ledger API v2 directly. The beta has no runtime dependencies and uses six endpoints:

- **Readiness:** `/v2/version`.
- **Identities:** `/v2/parties` and `/v2/users`.
- **Commands:** `/v2/commands/submit-and-wait-for-transaction`.
- **Queries:** `/v2/state/active-contracts` and `/v2/state/ledger-end`.

The JSON Ledger API v2 has no endpoint for TimeService, so the static-time helpers will add a gRPC client for that one service.

The beta's documented setup is Node.js 24.10, Java 21, DPM 1.0.21, and Canton 3.5.6. Running the Sandbox does not require Docker. 

Release documentation lists each supported Node.js, Java, DPM, and Canton version and the Ledger API operations STL uses. Published test results name the configurations they ran on.

#### Starting and stopping the Sandbox

`withSandbox()` reserves six free ports per instance, so parallel CI jobs and test files can each run their own Sandbox. It starts the Sandbox with a pinned Canton version. Instead of sleeping for a fixed delay, it waits until the Ledger API answers a health check. It then uploads the application's DARs. When the tests finish or fail, it stops the whole process group it started, so the Canton JVM does not outlive the test run.

Another process can still take a port between reservation and startup. If binding fails, STL reports the startup failure and cleans up the process it started. The release's automated tests start several Sandboxes in parallel, fail on any port collision, and exercise this failure path.

STL keeps the end of the process output and reports it when startup fails or the Sandbox exits unexpectedly.

For each tested configuration, the release documents two measurements from the public CI:

- the median time from `withSandbox()` to a ready Ledger API;
- each Sandbox's peak memory.

These measurements guide the isolation advice: use one Sandbox per suite by default, and a separate Sandbox only for tests that need their own clock or packages.

#### Preparing parties and users

Once the Sandbox is ready, `freshParties()` creates the parties and ledger users for an independent test. Using the Sandbox's administrative credentials, it grants each user `CanActAs`, the right to submit commands for its parties, and `CanReadAs`, the right to read what those parties can see. This follows Canton's [user-token and rights model](https://docs.canton.network/appdev/deep-dives/authorization). The helper returns full party IDs for Ledger API calls.

For authenticated runs, `withSandbox()` starts `dpm sandbox` with a generated Canton config file (`-c`) that sets the participant's `ledger-api.auth-services`. Protected JSON and gRPC Ledger API operations then reject requests without a valid token. The `/v2/version` endpoint used for readiness stays open.

Each Sandbox gets its own signing key and `target-audience`. STL serves the public key from a JWKS (JSON Web Key Set) endpoint inside the test process, using Canton's `jwt-jwks` auth-service type.

STL signs short-lived administrative tokens to allocate parties, grant rights, or change the clock. By default, the Sandbox rejects a token that expires more than five minutes ahead, so STL signs a new token whenever it needs one.

The private key stays inside the test process, is never shipped in the npm package, and is discarded when the Sandbox stops. STL only connects to the Sandbox it started. Because the key and audience differ per Sandbox, a token issued for one STL-managed Sandbox is rejected by another. The authenticated tests check this, and the example states that these credentials are for local tests only.

#### Using the Ledger API

`asParty()` creates a Ledger API client for an existing ledger user, with that user's credentials and party rights. Tests use it to submit commands for those parties and read the contracts and events visible to them.

The developer supplies a token provider that obtains the user's access token and handles expiry and renewal. STL passes it the user ID and the audience of the Sandbox it started.

Before every Ledger API request, including reads, the client calls the provider and attaches the returned token. If the provider fails, the failure reaches the test. The client never falls back to administrative credentials.

A developer-supplied provider must return tokens signed by a key the Sandbox trusts. Each token must carry the Sandbox's audience and the intended user. STL's Sandbox configuration trusts STL's generated test key, so an application's own provider needs one of two arrangements:

- The provider signs with STL's generated test key.
- The Sandbox is configured to trust the provider's key.

If the provider issues tokens valid for more than five minutes, the Sandbox's `max-token-lifetime` must also be raised. `withSandbox()` exposes this as an option.

For tests that do not bring the application's own provider, STL includes a test provider that issues short-lived tokens for its own Sandbox. The expiry and renewal tests use it.

The authenticated example (Milestone 1) documents:

- how a user created by `freshParties()` is matched to the identity its token carries;
- how the Sandbox's token validator trusts the test key;
- how administrative and user credentials differ;
- how signature, audience, expiry, and user identity are checked.

Its tests check that submissions and queries follow the intended user's rights. Negative tests cover a correctly signed token for the wrong user, a token signed by a key the Sandbox does not trust, a wrong audience, and an expired token.

This configuration checks the signing key, not the issuer claim. The tests establish the local Sandbox's authorization behavior, not compatibility with a production identity provider.

A test can also skip `asParty()` and use the application's own Ledger API client, so that client is the one under test. The release's Sandbox handle exposes the JSON Ledger API URL, and the token provider issues a token for any user `freshParties()` created.

#### Finding parties and contracts

Tests can use the IDs returned during setup and command submission directly. STL also provides three lookup helpers:

- `oneParty(requestedPartyName)` looks up a party by the name requested at creation, including any test suffix, through an administrative party-list query.
- `oneContract(ledgerClient, templateId)` queries active contracts of a template, using a client from `asParty()` and its parties' visibility.
- `createdContract(transaction)` finds the contracts created in a transaction response, for use in later steps. It stabilizes the beta's `createdContracts`, `createdContractIds`, and `singleCreatedContract` helpers.

Documentation and tests define what each lookup does when nothing matches, when several contracts match, and when a transaction creates several contracts. Lookup errors name the requested party or template and never include credentials.

#### Controlling ledger time

For tests of time-dependent rules, such as expiry dates, STL can start the Sandbox in static-time mode. The ledger clock starts at 1970-01-01T00:00:00Z, so tests that use real dates set it first.

STL reads and advances the clock through the gRPC Ledger API's TimeService (`GetTime`, `SetTime`). Canton serves TimeService only when static time is on. Reading needs any valid token; changing the clock needs an administrative one.

- `time.get()` reads the current ledger time.
- `time.set(newTime)` moves the ledger clock to a specified later time.
- `time.increase(duration)` advances the ledger clock by the given duration.

To change the clock, STL reads its current time, then calls `SetTime` with that time and the new time. If another test changes the clock between those calls, Canton rejects the request because the current time no longer matches. STL leaves the other test's change intact, re-reads the clock, and reports the expected and actual times.

Canton also rejects a time earlier than the current one. Calling a `time` helper on a Sandbox started without static time fails before any request is sent, with an error that says static time is required.

Changing ledger time does not change Node.js timers or external services' clocks.

#### Test isolation

Teams can reuse fixture functions to create the contracts each test needs. On a shared Sandbox, fresh parties and users keep the fixtures of independent tests apart.

Fresh identities do not reset the Sandbox. Counterparties used by several tests, uploaded packages, and the ledger clock stay shared. Tests that need these separated use separate Sandbox instances. External services need their own test setup.

#### Proof of concept

A beta is published on npm as [`@cobuilders/canton-stl`](https://www.npmjs.com/package/@cobuilders/canton-stl) (`0.1.0-beta.2`, Apache-2.0), with source at [CoBuilders-xyz/canton-stl](https://github.com/CoBuilders-xyz/canton-stl). It runs with authentication disabled. It already implements Sandbox startup on free ports, health-check readiness, process-group cleanup, DAR loading, fresh parties and users, Ledger API submission and queries, and helpers that extract created contracts from a transaction.

A separate repository, [canton-stl-oz-tests](https://github.com/CoBuilders-xyz/canton-stl-oz-tests), uses the published package to run selected OpenZeppelin scenarios from TypeScript against unchanged OpenZeppelin contracts, pinned to a fixed upstream commit:

- **Token:** the mint and query case from the token scripts OpenZeppelin already runs against the Sandbox in its CI, checking holding amounts and what each party's queries can see. OpenZeppelin's separate transfer and mint/burn scripts are out of the beta's scope.
- **Token utils:** tests cover 9 of 10 selected validation guards, including wrong admin, account, lock, and cancellation. The live-deadline case is skipped.
- **Vault:** 15 business checks from the suite OpenZeppelin runs in memory with `dpm test` now run through the real Ledger API. One assertion is skipped in each of 14 scenarios.

Each skip carries a comment explaining why. Each suite runs as its own GitHub Actions job ([run 42699246608](https://github.com/CoBuilders-xyz/canton-stl-oz-tests/actions/runs/42699246608), passed 2026-11-09) and uploads its logs as an artifact, including on failure.

The grant funds authenticated integration, static time, the lookup helpers, and broader compatibility testing.

### RFP and Roadmap Alignment

STL covers three of the areas listed in RFP 18, Integration into SDLCs, in the Foundation's [2026–2028 roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#developer-experience-tooling--education):

- **Testing frameworks:** helpers that run inside Mocha and Node's test runner.
- **CI/CD pipelines:** a Docker-free Sandbox that starts on every pull request.
- **Environment management:** Sandbox lifecycle, parties, users, and ledger time.

The Node.js testing tutorial delivered in Milestone 2 also contributes to RFP 15, which asks for "practical, developer-facing documentation … and examples that reduce the time required for new teams to build on Canton". 

### Backward Compatibility

No backward compatibility impact. STL is a development dependency of an application's test suite. It adds no ledger functionality and needs no change to Canton or to application code.

## Technical Rationale

**A library in the application's test language.** JavaScript and TypeScript helpers let Node.js applications prepare fixtures, get configured clients, submit commands, and assert within their existing test suites. Daml Script stays the right tool for contract tests and on-ledger setup; STL supplies the environment management for off-chain tests.

**npm as the primary interface.** Tests need STL's operations at different moments: identities before a case, a client during it, a clock change between assertions. An npm library exposes them directly as async calls. A DPM component could orchestrate a suite or expose commands, but tests would still need a Node.js layer to get the same programming interface.

**Why STL calls the JSON Ledger API directly.** A test helper that brings its own Ledger API client can conflict with the client version the application already uses. 

## Co-Marketing & Adoption

CoBuilders will run the outreach and produce the material below. We ask the Foundation to share the material through its channels, subject to its editorial approval.

- **Finding the first teams.** We will choose three public projects with their own Sandbox custom setup. We will approach projects with a full hand-written harness first, such as OpenZeppelin's `canton-specs` and BootNode's `canton-token-forge`. For each project, we will open an issue describing what STL would replace, then a migration PR, so the maintainers review working code.
- **Release post on the Canton forum.** A post on forum.canton.network when the alpha ships, reporting the before-and-after results from the reference application, with a link to the runnable example.
- **Before-and-after walkthrough.** Milestone 1's short recorded video shows CoBuilders replacing the reference application's hand-written Sandbox harness with STL in a public fork. 
- **Documentation contribution.** A Node.js testing tutorial submitted to the testing and CI/CD sections of docs.canton.network, where the backend integration-test example is Java-only today.
- **Integration case study.** One technical post per migration PR.

## Milestones and Deliverables

### Milestone 1: Sandbox test helpers

- **Work duration:** 6 weeks (ends at approval + 6 weeks).
- **Dependencies:** none; builds on the published beta.
- **Focus:** Deliver an alpha npm release with the complete helper set, listed below.
- **Deliverables:**
  - **Alpha npm package** with integration tests against a Sandbox with authentication enabled, and the full helper set:
    - `withSandbox()`: Sandbox lifecycle and diagnostics.
    - `freshParties()`: party and user creation, and rights setup.
    - `asParty()`: Ledger API access with a developer-supplied token provider.
    - `oneParty()`, `oneContract()`, and `createdContract()`: party and contract lookups.
    - The static-time helpers: clock control.
  - **Runnable example suite** combining these helpers with application fixtures and assertions, in Mocha and Node's test runner, including party and contract lookups and tests of time-dependent contract rules.
  - **Public source code, automated tests, and documentation** under Apache-2.0. The documentation covers installation, configuration, running the example, and tested configurations. Contributor documentation covers:
    - how to reproduce the compatibility tests;
    - how to submit a regression case;
    - how to match each npm version to its source revision;
    - how to prepare a release that another maintainer can reproduce from the public repository;
    - a private route for reporting security issues.
  - **Release post and before-and-after walkthrough.** A Canton forum post announcing the alpha, and a short recorded video. The video compares the reference application's original Sandbox harness with STL in CoBuilders' public fork, and shows the setup replaced and the tests passing in both versions.
- **Acceptance criteria:**
  - The alpha installs following the documentation, and the example suite passes with Mocha and Node's test runner.
  - Automated tests verify Sandbox startup, DAR loading, readiness, and cleanup after successful and failed tests.
  - Tests verify fresh parties and users and independent fixtures under parallel execution.
  - Authenticated tests verify authorized operations, rejection of missing, invalid, or expired tokens, party rights, cross-party read restrictions, and token renewal.
  - Automated tests verify party and contract lookups and created-contract extraction against known fixtures.
  - Static-time tests verify reading and advancing the Sandbox clock and the resulting behavior of time-dependent contract rules.
  - The reference application is a public project from an independent team. Its existing tests pass in a public fork both before and after STL replaces its Sandbox setup.
  - The walkthrough reports the lines of setup code removed and the CI run time before and after. The release post and walkthrough link to runnable versions.
  - CI reports Sandbox startup time and peak memory for each configuration the release documentation lists as tested.
  - Evidence includes the npm version, source revision, tested configurations, and test results.

### Milestone 2: Release and application integrations

- **Work duration:** 2 weeks (ends at approval + 8 weeks).
- **Dependencies:** the Milestone 1 alpha.
- **Focus:** Publish the release and demonstrate its use in independent applications. No new helpers are built in this milestone.
- **Deliverables:**
  - **npm release** of the Milestone 1 helper set, with fixes for issues found in the alpha and updated documentation.
  - **Three migration PRs prepared by CoBuilders.** Each is opened against a different public project owned by an independent team and replaces its hand-written Sandbox setup with STL. One targets the Milestone 1 reference application. Each PR documents the setup replaced, required adaptations, and remaining limitations. CoBuilders answers the maintainers' review.
  - **Documentation contribution.** A runnable Node.js testing tutorial submitted to docs.canton.network.
  - **Integration case studies.** One published technical post per migration PR.
- **Acceptance criteria:**
  - The published release passes the Milestone 1 tests and example suite in the documented supported configurations.
  - Three migration PRs are open, each against a different public project owned by an independent team. Merging is not required.
  - Each PR replaces the project's existing Sandbox startup and teardown in at least one suite and keeps its application fixtures and assertions.
  - That suite passes in a public CI run on the PR branch. The run is in the project's own CI or, where that does not run for outside contributors, in CoBuilders' public fork.
  - The tutorial runs in a supported configuration and is submitted to Canton's documentation, with a link to the submission.
  - A technical case study is published per migration PR, documenting the setup replaced, adaptations, any feedback from the maintainers, and remaining limitations.
  - Evidence includes source revisions, reproduction instructions, CI results, and any review comments the maintainers left on the PRs.

### Milestone 3: Maintenance and adoption follow-up

- **Maintenance period:** 12 months after the Milestone 2 release (approval + 8 weeks to approval + 14 months).
- **Dependencies:** the Milestone 2 release.
- **Focus:** Maintain STL and support its continued use in the integrated applications.
- **Deliverables:**
  - **What CoBuilders guarantees for the 12 months:** compatibility with the supported range of Canton versions, and fixes for critical bugs.
  - **Supported range.** The current Canton major version (3.x today). A new major joins the range 30 days after its release. Older majors are outside it.
  - **Compatibility updates** for each new Sandbox release in the supported range. Test results and documentation name the tested configurations. Within 30 days of each such release, CoBuilders publishes one of two compatibility verdicts:
    - tested and supported;
    - supported after a fix, naming the regression and the fix.
  - **Critical bugs.** A critical bug is a security issue in STL itself, or a bug that makes a documented helper fail or return a wrong result on a supported configuration. CoBuilders fixes these. Other reported bugs and integration issues are triaged in public and fixed in maintenance releases.
  - **Monthly reports**, published for each of the 12 months. Each report records:
    - every Sandbox release in the supported range, its verdict, the CI run that decided it, and the days between release and verdict. The report lists releases of older majors as outside the range;
    - reported and open issues, actions taken, published updates, and remaining limitations, with each critical bug listed next to the release that fixed it;
    - each issue opened outside CoBuilders, with its time to first response and to resolution;
    - the state of each migration PR, ongoing use by the teams that merged one, and their feedback;
    - npm downloads, public repositories that depend on STL (GitHub dependency graph), pull requests opened outside CoBuilders, and the integrations known to be in use.
  - **External code owner.** During the maintenance period, CoBuilders selects a maintainer from outside CoBuilders and adds them to the repository's `CODEOWNERS`, with the right to review and approve changes.
  - **Handover document.** A `MAINTAINERS.md` covering the release process, the compatibility matrix, how a new Sandbox release is checked, and who holds the npm and CI credentials, so another maintainer can take STL over from the public repository.
  - **After the 12 months:**
    - Before the period ends, CoBuilders publishes a `CONTRIBUTING.md` that tells outside contributors how to propose, test, and release a change.
    - CoBuilders stays on as reviewer and approver of open-source contributions, alongside the external code owner.
    - Critical bugs and compatibility with new Sandbox releases are then handled as CoBuilders' availability allows, with no committed response time.
    - If the Foundation asks, CoBuilders transfers the repository to a Foundation GitHub organization and publishes the package under a neutral npm scope, leaving a deprecation notice on the current package that points to the new one.
  - **Adoption targets.** Three projects adopt STL during the maintenance period. A project adopts STL when it has an STL integration on its default branch and the suite using it passes in the project's own CI. The integration can be a merged CoBuilders migration PR or one the team wrote itself. The three need not be the Milestone 2 projects.
- **Acceptance criteria:**
  - Maintenance is evaluated and paid by quarter, in four equal parts. A quarter is accepted when its three monthly reports are published, every Sandbox release in the supported range published in that quarter has its verdict, and the critical bugs reported in that quarter are fixed. The criteria below apply to each quarter, except the one on `CONTRIBUTING.md`, `MAINTAINERS.md`, and `CODEOWNERS`, which applies to the fourth quarter.
  - A monthly report with the contents listed above is published for each month of the 12-month maintenance period.
  - `CONTRIBUTING.md` and `MAINTAINERS.md` are in the repository before the maintenance period ends, and `CODEOWNERS` lists at least one code owner from outside CoBuilders.
  - Maintenance and compatibility releases include test results and updated documentation identifying tested configurations.
  - Every Canton Sandbox release in the supported range published during the maintenance period has a verdict, published within 30 days of that release. Critical bugs reported in the period are fixed.
  - The adoption payment is split into three equal parts, one for each project that adopts STL during the maintenance period, up to three projects. Each part is paid when its project qualifies, independently of the others.
  - Adoption evidence names each team, project, and STL version, with the commit on the default branch and the date of the supporting run in the project's CI. It separates CoBuilders' own example runs from runs in the project's CI. Where a project's CI is not public, its team confirms the run in writing.

## Acceptance Criteria

The Tech & Ops Committee evaluates each milestone against the acceptance criteria listed under that milestone. In summary:

- **Milestone 1** is accepted when the alpha installs by following the documentation, and its automated tests and example suite pass. The tests cover Sandbox lifecycle, parties and users, authentication, lookups, and static time. The reference application also runs on STL in a public fork.
- **Milestone 2** is accepted when the release is published and three migration PRs are open against projects owned by independent teams, each with a passing public CI run. The tutorial is submitted to Canton's documentation, and a case study is published for each PR. Merging is not required.
- **Milestone 3, maintenance,** is accepted and paid by quarter. A quarter is accepted when a report is published for each of its three months, every Sandbox release in the supported range has a verdict within 30 days, and critical bugs are fixed. `MAINTAINERS.md`, `CONTRIBUTING.md`, and an external code owner are in place before the fourth quarter is accepted.
- **Milestone 3, adoption,** is paid per project: one part for each project that has STL on its default branch with a passing run in its own CI, up to three projects.

Two rules apply across all milestones:

- **Public and open source.** Source code, automated tests, and examples are in a public GitHub repository under Apache-2.0 before any milestone is accepted.
- **Independent team.** An independent team is an organization other than CoBuilders. It works in an application repository CoBuilders does not own and does not pay CoBuilders for the integration. Adoption is counted per project: two projects from the same independent team count as two.

## Funding

### Total Funding Request

We request 400,000 CC to fund eight weeks of development and application integration, followed by twelve months of maintenance and adoption follow-up:

- **Milestone 1:** 230,000 CC for all helper development (authenticated access, static time, and lookups), plus the example suite and the reference migration.
- **Milestone 2:** 39,000 CC for the release, the tutorial, and the case studies. The three migration PRs are delivered in this milestone, but their cost is paid through adoption.
- **Maintenance:** 62,000 CC for twelve months, paid in four quarterly parts of 15,500 CC.
- **Adoption:** 69,000 CC, paid only for demonstrated adoption, at 23,000 CC for each project. This includes the cost of the migration work, so CoBuilders is paid for that work only when a project adopts STL.

### Payment Breakdown

| Milestone | Funding | Payment |
| --- | --- | --- |
| M1: Sandbox test helpers | 230,000 CC | On acceptance of the alpha, example suite, and release materials. |
| M2: Release and application integrations | 39,000 CC | On acceptance of the release, the three migration PRs, and documentation deliverables. |
| M3: Maintenance and adoption follow-up | 62,000 CC | 15,500 CC at the end of each quarter of the maintenance period, on acceptance of that quarter's maintenance and compatibility criteria, independently of adoption outcomes. |
| M3: Adoption | 69,000 CC | 23,000 CC for each project that adopts STL as defined in Milestone 3, up to three projects. |

Adoption payments follow the evidence rules in Milestone 3. npm download counts are not payment criteria.

### Volatility Stipulation

The grant will be denominated in fixed Canton Coin and re-evaluated at the six-month mark.

## Team & Qualifications

CoBuilders is a Web3 engineering studio. We have delivered work for and alongside Arbitrum, the Nomic Foundation, OpenZeppelin, CoW Protocol, Tools for Humanity (World), and ZetaChain. More at [cobuilders.xyz](http://cobuilders.xyz/).

**We have built this kind of tool before.** Our Hardhat plugin suite for Arbitrum Stylus, [`@cobuilders/hardhat-arbitrum-stylus`](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus), is live on npm ([docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/)). Its four composable plugins bring the Stylus lifecycle into Hardhat 3: local node, compile, deploy, and test. The plugins provide automatic EVM vs WASM detection and cross-VM testing in one project. The suite was built with an Arbitrum ecosystem grant and featured in the Arbitrum Foundation's [builder newsletter](https://blog.arbitrum.foundation/builders-block-022-arbitrums-mid-year-recap-new-stylus-hardhat-plugin/). STL follows the same pattern: a missing testing workflow, added to the toolchain developers already use, and delivered as a maintained npm package.

We have also provided technical capacity directly to the Nomic Foundation, the team behind Hardhat. That gave us an inside view of how lasting test tooling is designed and maintained.

**We check what users need before we build.** This proposal began with the interview and the public harness code described under Motivation. Developer tools fail more often on adoption than on technology: they solve a problem nobody had, or a real one in a form nobody adopts. Our team combines engineering with product, company-building, and business-development experience.

**That combination is what gets a library adopted.** We have written working code against the Sandbox: the beta already runs. Getting a library into other teams' CI also takes understanding what each team needs, the credibility to ask them to try it, and the follow-through to fix what they report. We do the engineering and the adoption work, and we are paid for adoption only if it happens.

**Proposed team:**

- Lautaro Sole, CEO and Co-Founder. [LinkedIn](https://www.linkedin.com/in/lautaro-sole/)
- Augusto Collerone, CTO and Co-Founder. [LinkedIn](https://www.linkedin.com/in/augusto-collerone/) | [GitHub](https://github.com/augustocollerone)
- Ignacio Fernandez, Technical Lead. [LinkedIn](https://www.linkedin.com/in/ignacio-fq/) | [GitHub](https://github.com/nachfq)
- Gimer Cervera, Ph.D., Blockchain Engineer. [LinkedIn](https://www.linkedin.com/in/gimercervera/) | [GitHub](https://github.com/Gimer0x)
