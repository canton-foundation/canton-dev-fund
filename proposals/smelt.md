## Development Fund Proposal

**Author:** Ferhat Rudvanogullari
**Status:** Draft
**Created:** 2026-02-22

---

## Abstract
This proposal introduces **Smelt** — a suite of open-source GitHub Actions that provide first-class CI/CD support for Daml and Canton projects. Currently, the Canton ecosystem has **zero official GitHub Actions**, forcing every developer team to build and maintain their own Docker images, shell scripts, and custom pipeline configurations from scratch. Smelt delivers a production-ready set of composable GitHub Actions that handle SDK installation, `.dar` building, testing, deployment, and multi-version matrix testing — turning what currently takes days of pipeline engineering into a single `uses:` line.

The name **Smelt** (smelting — extracting metal from ore) reflects the tool's purpose: taking raw Daml source code and refining it through the CI/CD pipeline into production-ready artifacts. Smelt is part of the same metallurgy-themed tooling family as **Cast** (the Daml-to-OpenAPI bridge).

---

## Specification

### 1. Objective
Since July 2022, the Daml community has repeatedly requested official GitHub Actions for the Daml SDK ([Daml Forum Discussion](https://discuss.daml.com/t/are-there-any-officially-published-github-actions-for-daml-sdk/5647)). The confirmed answer has been: **"There are no official GitHub Actions for the Daml SDK."**

This gap creates real costs:
- **Duplicated effort:** Every team independently writes CI/CD scripts for Daml.
- **Fragile pipelines:** Custom Docker images and shell-based installations break on SDK updates.
- **Slow onboarding:** New developers spend hours configuring CI before writing their first Daml line.
- **No standardization:** No community-agreed best practice for testing and deploying Daml projects.

The objective is to deliver **Smelt**, a canonical and maintained set of GitHub Actions that any Daml/Canton developer can use immediately, eliminating this longstanding ecosystem gap.

### 2. Implementation Mechanics

Smelt delivers **four composable GitHub Actions**, published to the GitHub Marketplace:

#### Action 1: `smelt-setup`
Installs the Daml SDK on a GitHub Actions runner.
```yaml
- uses: smelt-actions/setup@v1
  with:
    sdk-version: '3.4.0'  # or 'latest'
```
- Downloads and caches the Daml SDK (drastically reducing CI times on repeat runs).
- Supports Ubuntu, macOS, and Windows runners.
- Adds `daml` to PATH for subsequent steps.
- Supports version pinning, ranges, and `latest` resolution.

#### Action 2: `smelt-build`
Compiles Daml projects and produces `.dar` artifacts.
```yaml
- uses: smelt-actions/build@v1
  with:
    project-dir: './my-daml-project'
    upload-dar: true
```
- Runs `daml build` with configurable options.
- Optionally uploads `.dar` files as GitHub Artifacts.
- Validates `daml.yaml` configuration before build.

#### Action 3: `smelt-test`
Runs Daml Script tests with structured output.
```yaml
- uses: smelt-actions/test@v1
  with:
    project-dir: './my-daml-project'
    test-pattern: '**/*Test.daml'
```
- Executes `daml test` with JUnit XML output for GitHub's test summary UI.
- Supports test filtering and parallel execution.
- Integrates with GitHub's native test annotations (inline failure markers on PRs).

#### Action 4: `smelt-deploy`
Deploys `.dar` packages to a Canton participant node.
```yaml
- uses: smelt-actions/deploy@v1
  with:
    dar-path: './.daml/dist/my-project.dar'
    ledger-host: ${{ secrets.LEDGER_HOST }}
    ledger-port: 6865
    auth-token: ${{ secrets.LEDGER_TOKEN }}
```
- Uploads `.dar` to a running Canton node via the Ledger API.
- Supports token-based authentication.
- Includes health-check and retry logic.

#### Composite Workflow Templates
In addition to individual actions, Smelt provides **starter workflow templates** (`.github/workflows/`) that compose these actions into common patterns:
- **Basic CI:** setup → build → test (for every PR)
- **Release Pipeline:** setup → build → test → deploy (on tag push)
- **Multi-Version Matrix:** Test against multiple Daml SDK versions simultaneously

**Example — Complete Smelt CI Pipeline:**
```yaml
name: Smelt CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: smelt-actions/setup@v1
        with:
          sdk-version: '3.4.0'

      - uses: smelt-actions/build@v1
        with:
          upload-dar: true

      - uses: smelt-actions/test@v1
```

### 3. Architectural Alignment
This project directly addresses the **Developer Tooling** priority defined in CIP-0082/CIP-0100. GitHub Actions are the most widely used CI/CD platform globally (used by 90%+ of open-source projects). Providing dedicated CI/CD actions for the Canton ecosystem:
- Lowers the barrier to entry for new developers.
- Establishes standardized CI/CD practices across the ecosystem.
- Complements existing tooling like the Daml SDK CLI and JSON Ledger API.
- Synergizes with the **Cast** proposal — once Cast generates OpenAPI schemas, Smelt's build action can trigger SDK generation in the same pipeline, creating a seamless Daml → OpenAPI → Type-Safe SDK workflow.

### 4. Backward Compatibility
*No backward compatibility impact.*
These are purely additive CI/CD tools. They wrap existing Daml SDK CLI commands and do not modify any Canton or Daml runtime behavior.

---

## Milestones and Deliverables

### Milestone 1: `smelt-setup` — Core Foundation
- **Estimated Delivery:** 3 Weeks
- **Focus:** Daml SDK installation, caching, and cross-platform support.
- **Deliverables / Value Metrics:**
  - Published `smelt-actions/setup` action on GitHub Marketplace.
  - Cross-platform support (Ubuntu, macOS, Windows).
  - SDK caching with 80%+ cache hit rate on repeat runs.
  - Comprehensive test suite using GitHub Actions' own CI.
  - Documentation with usage examples.

### Milestone 2: `smelt-build` and `smelt-test` Actions
- **Estimated Delivery:** 3 Weeks
- **Focus:** Build and test automation with GitHub-native integrations.
- **Deliverables / Value Metrics:**
  - Published `smelt-actions/build` action with `.dar` artifact uploading.
  - Published `smelt-actions/test` action with JUnit XML reporting.
  - GitHub PR annotations for test failures (inline error markers).
  - Starter workflow templates for common CI patterns.
  - Integration tests against real Daml projects.

### Milestone 3: `smelt-deploy` and Ecosystem Templates
- **Estimated Delivery:** 3 Weeks
- **Focus:** Deployment automation and production-ready workflow templates.
- **Deliverables / Value Metrics:**
  - Published `smelt-actions/deploy` action with secure credential handling.
  - Complete release pipeline template (build → test → deploy on tag).
  - Multi-version matrix testing template.
  - Migration guide for teams using custom Docker-based pipelines.
  - End-to-end example repository demonstrating full CI/CD lifecycle.

### Milestone 4: Documentation, Community Launch, and Marketplace Listing
- **Estimated Delivery:** 2 Weeks
- **Focus:** Developer experience, documentation, and adoption.
- **Deliverables / Value Metrics:**
  - Full documentation site with quickstart guide, API reference, and troubleshooting.
  - GitHub Marketplace verified listing for all four Smelt actions.
  - Community feedback collection and v1.1 patch release addressing early adopter feedback.
  - Contribution guide for community-driven extensions.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- All four Smelt actions published and functional on GitHub Marketplace.
- Cross-platform CI demonstrated (Ubuntu, macOS, Windows) for `smelt-setup`.
- Successful build and test cycle for at least 3 reference Daml projects of varying complexity.
- JUnit test reporting correctly renders in GitHub's PR summary UI.
- Deployment action successfully uploads a `.dar` to a Canton Sandbox node in CI.
- SDK caching reduces repeat installation time by at least 70%.
- All actions released under Apache 2.0 license with comprehensive documentation.
- Starter workflow templates validated in real-world CI environments.

---

## Funding

**Total Funding Request:** 400,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Smelt Setup): 120,000 CC upon committee acceptance
- Milestone 2 (Smelt Build + Test): 120,000 CC upon committee acceptance
- Milestone 3 (Smelt Deploy + Templates): 100,000 CC upon committee acceptance
- Milestone 4 (Docs + Launch): 60,000 CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the author will collaborate with the Foundation on:
- A launch announcement: *"Introducing Smelt — CI/CD for Canton in One Line"*
- A technical blog post with migration guide for teams currently using custom CI solutions.
- A live demo/workshop showing full CI/CD pipeline setup in under 10 minutes.
- Promotion through the Daml Forum, GitHub Marketplace, and developer communities.

---

## Motivation
CI/CD is the backbone of modern software development. Every serious project relies on automated build, test, and deployment pipelines. The complete absence of dedicated GitHub Actions for the Daml ecosystem is a **critical gap** that has been acknowledged since 2022 but never addressed. This gap:

1. **Slows adoption:** Teams evaluate a new technology stack partly by its CI/CD ecosystem maturity. The lack of dedicated actions signals immaturity.
2. **Wastes developer time:** Hundreds of teams independently solve the same problem — installing the SDK in CI.
3. **Creates fragility:** Custom scripts break silently on SDK updates, causing cascading failures.
4. **Limits ecosystem growth:** Without easy CI/CD, the path from "hello world" to "production deployment" remains unnecessarily complex.

By providing Smelt, we transform the Canton CI/CD story from "roll your own" to "one line and done."

---

## Rationale
**Why GitHub Actions?**
GitHub Actions is the dominant CI/CD platform for open-source development. Every major blockchain ecosystem (Solana, Ethereum/Foundry, Substrate) provides dedicated GitHub Actions. The Canton ecosystem's absence from the Marketplace is a visible gap.

**Why composable actions instead of a monolithic solution?**
Composable actions follow GitHub's best practices and allow teams to mix-and-match exactly what they need. A team that only needs `smelt-setup` can use it without pulling in deployment logic.

**Why not just Docker images?**
Docker-based approaches are slower (image pull overhead), less transparent, and harder to customize. Native GitHub Actions with smart caching provide significantly faster CI runs and better integration with GitHub's UI features (annotations, test summaries, artifact management).

**Why the name "Smelt"?**
Smelting is the metallurgical process of extracting usable metal from raw ore. Smelt takes raw Daml source code and refines it through the CI/CD pipeline into production-ready `.dar` artifacts. It belongs to the same tooling family as **Cast** (the Daml-to-OpenAPI bridge) — together they form a complete metallurgy-themed developer experience: **Smelt** (refine the code) → **Cast** (shape the API).

**Alternatives considered:**
- *Official Docker images only:* Rejected — slower, less GitHub-native, no marketplace discovery.
- *Single monolithic action:* Rejected — violates composability principle, harder to maintain.
- *Community-maintained actions:* Rejected — lack of backing creates trust issues for enterprise adoption.

---

## Risks and Mitigations
- **Risk: Daml SDK installation process changes across versions.**
  - *Mitigation:* Smelt will abstract installation behind a version-aware installer that adapts to SDK changes. Automated nightly tests against `latest` SDK version will catch breaking changes early.
- **Risk: Low initial adoption.**
  - *Mitigation:* Co-marketing with Foundation, inclusion in getting-started guides, and direct outreach to active community members.
- **Risk: Cross-platform compatibility issues (especially Windows).**
  - *Mitigation:* CI matrix testing across all three OS platforms on every release. Windows support prioritized as a first-class target.

---

## Team and Capabilities
The author is a student developer and blockchain enthusiast dedicated to contributing to the Canton Network ecosystem. Leading a small, dynamic team of peers, we combine fresh academic perspectives with hands-on experience in Daml smart contracts, GitHub Actions development, and modern CI/CD tooling. Our mission is to lower the barrier to entry for the next generation of Canton developers by building high-quality, open-source infrastructure tools.
