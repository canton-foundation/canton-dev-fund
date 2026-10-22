## **Development Fund Proposal**

**Organization:** Moonsong Labs & Digital Asset

**Author / Primary Contact:** Moonsong Labs: Facundo Farall (ffarall), Tomas Moreno (tomimor)

**Status:** Submitted

**Created:** 2026-10-22

**Proposal Type:** RFP-aligned 

**RFP / Roadmap Area:** [RFP 15, Canton 3.x Training and Documentation](https://github.com/canton-foundation/canton-dev-fund/blob/d03ee272d11e1ca9106ef9696fba0ffe00acaa9b/2026-2028-strategic-roadmap.md?plain=1#L185); Milestone 2 also serves [RFP 14, Wallet and dApp Integration Tooling](https://github.com/canton-foundation/canton-dev-fund/blob/d03ee272d11e1ca9106ef9696fba0ffe00acaa9b/2026-2028-strategic-roadmap.md?plain=1#L177), and [RFP 19, DPM Components and Extension Ecosystem](https://github.com/canton-foundation/canton-dev-fund/blob/d03ee272d11e1ca9106ef9696fba0ffe00acaa9b/2026-2028-strategic-roadmap.md?plain=1#L207) 

**Champion:** [Curtis Hrischuk](https://github.com/hrischuk-da) (Digital Asset) 

**Total Funding Request:** 12,950,000 CC

**Project Duration:** 10.5 months

**Label:** [`daml-tooling`](https://github.com/canton-foundation/canton-dev-fund/labels/daml-tooling)

---

## **Abstract**

[CN QuickStart](https://github.com/digital-asset/cn-quickstart) is a trusted, strong onboarding resource that today lags behind current Canton development practices, standards, and tools. In the [Q1 2026 developer survey tooling report](https://docs.google.com/document/d/1Bojx0Bep9qZiuo8e8cVdOWzeoZDBs1lNYOQsdOPQow4/edit?usp=sharing), QuickStart had the highest regular use of any tool surveyed (56%) and the fewest respondents unaware of it (5%), yet 25% had tried it but found it missing features.

Moonsong Labs and Digital Asset propose uplifting QuickStart ("QuickStart Uplift") to become an exemplar implementation of best practices for building a dApp:

1. **Current stack and standards:** Upgrade QuickStart to the latest Splice release, Token Standard V2, app rewards, contract keys, a new React frontend, and a new TypeScript backend to support planned development. 
2. **External signing, browser wallet, and `dpm quickstart`:** The backend signs through the Wallet SDK, then the App User signs with the browser wallet extension through the dApp SDK, completing the CIP-0103 split between wallet, dApp, and backend. QuickStart ships as a `dpm` component, following current best practices and replacing Makefile commands.
3. **Documentation, education, validation, maintenance & adoption:** Validate the updated QuickStart through testing by developers from at least 10 external organizations. Educate the Canton ecosystem on the upgraded QuickStart by publishing documentation and videos, and hosting a webinar on Canton ecosystem first steps using the QuickStart. Deliver a “Gaps & Opportunities” report on the ecosystem components QuickStart integrates. Update 22 sections in [Canton Network docs](https://github.com/canton-network/cf-docs) directly referencing QuickStart, covering approximately 120 pages.

The project duration is 10.5 months, with a total funding request of 12,950,000 CC. Throughout the project, we will document new features, maintain and update the Splice and Daml versions, and keep QuickStart aligned with the latest releases. 

---

## **Specification**

### **1. Objective**

Update CN QuickStart to serve as the exemplar implementation for building a dApp on the Global Synchronizer. The table below outlines the changes we are proposing under this grant: 

| **Area** | **Today** | **After the Quickstart Uplift** |
| --- | --- | --- |
| Splice | 0.6.11, while DevNet runs 0.9.3 | Updated to the latest version running in DevNet at the time of the last milestone delivery |
| Token standard | V1 | V2 (CIP-0112) |
| App rewards | Not used | Traffic-Based App Rewards (CIP-0104) |
| Contract keys | Not used | Keys being used on daml templates. |
| Backend | Java, 3,342 lines | TypeScript, using the Wallet SDK |
| Signing | The validator signs for both parties | Shown in three stages: validator, backend through the Wallet SDK, user signing with browser wallet extension |
| Wallet | Splice wallet UI | A CIP-0103 browser wallet, connected using the dApp SDK |
| External parties | A curl and OpenSSL guide to external party operations.  | Two parties with two different kinds of external signing: App User party using a browser wallet extension, and App Provider party with keys held by a backend using Wallet SDK |
| CLI | Makefile wrappers around `dpm` | A combination of `dpm` commands and scripts. |
| Debugging | A Grafana and Prometheus observability stack (mostly unused today and infra-heavy) | lnav style logging and debugging, with the observability stack removed |
| Tests | Daml Script and Playwright suites | The same suites plus an end-to-end test per signing path, run on LocalNet in CI |
| Dev Experience | Clone the repository and run Make targets | Ship quickstart as a `dpm` component `dpm quickstart`  |
| Documentation | Covers current implementation.  | Updated to new standards and versions and included in the new unified Canton docs |

### **2. Implementation Mechanics**

#### **Current implementation**

QuickStart is an example software licensing dApp between an App Provider and an App User parties. It is not just a simple demo app. QuickStart is composed of:

- a large codebase including a  [Java backend](https://github.com/digital-asset/cn-quickstart/tree/main/quickstart/backend) and a React frontend (~4k LOC)
- [a comprehensive](https://github.com/digital-asset/cn-quickstart/tree/main/quickstart/daml/licensing) licensing workflow implemented in Daml, with a [Daml Script test suite](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/daml/licensing-tests/daml/Licensing/Scripts/TestLicense.daml)
- a vendored copy of LocalNet
- a [Grafana and Prometheus stack](https://github.com/digital-asset/cn-quickstart/tree/main/quickstart/docker/modules/observability) for observability
- a [Playwright end-to-end suite](https://github.com/digital-asset/cn-quickstart/tree/main/quickstart/integration-test/tests)
- [extensive documentation](https://github.com/digital-asset/cn-quickstart/tree/main/sdk/docs)

The current QuickStart teaches Canton fundamentals well, but it runs on old versions and doesn't yet cover several newer ecosystem standards and tools:

- It pins Splice 0.6.11, three minor lines behind DevNet, and [`sync-network.sh`](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/sync-network.sh) can no longer read the network version endpoint.
- Payments use Token Standard V1, and the app is not involved in app rewards.
- The validator signs for both parties. External signing exists only as a [guide](https://github.com/digital-asset/cn-quickstart/blob/main/sdk/docs/sharable/sdk/quickstart/operate/how-to-onboard-external-parties-in-quickstart.rst) using curl and OpenSSL commands.
- The App User approves payments in the Splice wallet UI rather than through a CIP-0103 wallet.
- The backend is written in Java, while the ecosystem has adopted a TypeScript-first approach, with the Wallet SDK and dApp SDK as TypeScript packages.

#### **Quickstart Uplift Implementation: milestones with release versioning**

The milestone approach has considered delivering an incremental version of the Quickstart with tagged releases, taking into account dependency readiness:

| **Milestone** | Month Duration | Main deliverable | **Release tag** |
| --- | --- | --- | --- |
| M1 | 3.5 | Current Splice, Token V2, CIP-0104, TypeScript backend | `uplift-m1` |
| M2 | 3.5 | Wallet SDK external signing, CIP-0103 browser wallet, and `dpm quickstart` | `uplift-m2` |
| M3 | 3.5 | Documentation, education, external validation, and “Gaps & Opportunities” Report | `uplift-m3`  |

More details are in the milestones section deliverables. Documentation, maintenance of developed features, and fixes of any reported bugs run across every stage. 

### Dependency: Status, definitions and fallbacks

Quickstart Uplift milestones depend on integrating a series of components into the Quickstart implementation. Readiness and version compatibility are analyzed below, with fallbacks and definitions:

| Component | **Milestone** | Status | Risk | **Definition** |
| --- | --- | --- | --- | --- |
| [Splice](https://github.com/canton-network/splice) and Daml SDK | M1 | QuickStart pins Splice 0.6.11, while DevNet runs 0.9.3. [`sync-network.sh`](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/sync-network.sh) can no longer read the network version endpoint. | None | The target version will be based on latest DevNet deployed version as the Milestone completion date.  |
| [Token Standard V2 (CIP-0112)](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) | M1 | QuickStart's licensing contracts still use V1. | None | No blockers to be implemented. |
| [Traffic-Based App Rewards (CIP-0104)](https://github.com/canton-foundation/cips/blob/main/cip-0104/cip-0104.md) | M1 | The packages are on the ledger, but QuickStart doesn't use them. | None | No blockers to be implemented. |
| [`dpm`](https://github.com/digital-asset/dpm) | M1, M2 | v3.5.2 already builds and tests QuickStart's Daml. Makefile wrappers remain. | None | No blockers to be implemented. |
| LocalNet | M1,M2 | A vendored copy [pinned to a 2025 commit](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/links.csv). The [script that copies it](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/copy_external_dirs.sh) breaks if re-run. | None.  | Scripts will be updated to work with the latest version of Splice.  |
| [Wallet SDK](https://www.npmjs.com/package/@canton-network/wallet-sdk) | M2 | Published (v1.5.3), TypeScript only. QuickStart has no `@canton-network/*` dependencies today. | None | No blockers to be implemented. |
| Token Standard V2 support in the Wallet SDK | M2 | Not in any published release yet.  | Currently, Wallet SDK helpers and wrappers are wired to Token Standard V1 template. | If Wallet SDK helpers are not updated to V2 before the M2 start date, the raw transactions will be build without resorting to the Wallet SDK helpers.  |
| [dApp SDK](https://www.npmjs.com/package/@canton-network/dapp-sdk) ([CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)) | M2 | Published (v1.7.1, spec v0.5.0), with a working reference app.  | None | No blockers to be implemented. |
| [Browser wallet extension](https://github.com/canton-network/wallet/tree/main/wallet-gateway/extension) | M2 | Not ready to be implemented yet. Digital Asset is finishing it under [grant #90](https://github.com/canton-foundation/canton-dev-fund/pull/90). | Browser wallet not being ready to be integrated with the QuickStart frontend.  | If browser wallet extension implementation doesn’t support the features needed for the frontend flow at the start of M2*, QuickStart M2 ships using `wallet-gateway-remote` instead. |
| [`wallet-gateway-remote`](https://www.npmjs.com/package/@canton-network/wallet-gateway-remote) | M2 (fallback for browser wallet extension) | Published. Implements the full user API and all seven signing drivers. | None | No blockers to be implemented. |
| [Contract keys](https://docs.canton.network/appdev/modules/m3-contract-keys) | M1, M2 | Live on DevNet, TestNet, and MainNet since the protocol version 35 upgrade. | Externally signed transactions that use keys require hashing scheme V3, so the selected wallet must support it. | V3-hashed transactions will only be used if needed and supported by wallet definition. If not supported, the backend will resolve the contract ID by key and the dApp client submits a regular exercise command. |
| [External parties and prepare, sign, submit, confirm](https://github.com/digital-asset/canton/blob/release-line-3.4/community/ledger-api/src/main/protobuf/com/daml/ledger/api/v2/interactive/interactive_submission_service.proto) | M2 | Shipped in Canton 3.4, so no version bump is needed. QuickStart covers it only in a [curl and OpenSSL guide](https://github.com/digital-asset/cn-quickstart/blob/main/sdk/docs/sharable/sdk/quickstart/operate/how-to-onboard-external-parties-in-quickstart.rst). | None | No blockers to be implemented. |
| [Unified Canton docs](https://docs.canton.network/sdks-tools/reference-projects/cn-quickstart) | M3 | Docs published to [docs.canton.network](http://docs.canton.network) will need to be updated.  | None | No blockers to be implemented. |

\* Browser wallet extension readiness to be integrated will be evaluated on the following conditions: (1) can connect to LocalNet, (2) it supports the dApp API methods necessary for the frontend QuickStart flow, and (3) keeps its state across restarts.

#### **Quickstart Uplift: Repo ownership & implementation collaboration**

Implementation will be done as a collaboration: 

- Digital Asset will retain repository ownership, weigh in on the architecture and design decisions, ensure best practices, and review PRs. CI will run in Digital Asset’s existing GitHub environment.
- Moonsong Labs will implement the work through pull requests to [digital-asset/cn-quickstart](https://github.com/digital-asset/cn-quickstart).

This setup reduces the trust surface for new developers entering the ecosystem and builds on existing work and repo positioning. 

### **3. Architectural Alignment**

This proposal aims to incorporate the following tools and CIPs as the primary ecosystem developments from the latest in Canton:

- **[CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) (dApp Standard).** Milestone 2 adopts the dApp SDK and the browser wallet, so the dApp connects to wallets through the standard interface instead of the Splice wallet UI.
- **[CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) (Token Standard V2).** The licensing contracts move to V2.
- **[CIP-0104](https://github.com/canton-foundation/cips/blob/main/cip-0104/cip-0104.md) (Traffic-Based App Rewards).** The new rewards model replaces featured-app activity markers.
- **Wallet SDK.** Milestone 2 uses the published [`@canton-network/wallet-sdk`](https://www.npmjs.com/package/@canton-network/wallet-sdk) and [`dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk) packages as-is.
- **dpm.** QuickStart builds and tests using [`dpm`](https://github.com/digital-asset/dpm), ships as a `dpm` component, and follows `dpm` [multi-package](https://github.com/digital-asset/cn-quickstart/blob/main/quickstart/daml/multi-package.yaml) conventions for its DAR layout.
- **Contract keys.** The licensing templates use non-unique contract keys as stable references across renewals.

### **4. Backward Compatibility**

QuickStart is a reference implementation, so these changes have no runtime impact.

- Teams that have already forked QuickStart will see breaking changes: the backend language, the token standard version, and the custody model all change.
- Each tagged release ships with upgrade notes that explain what changed and why.
- `dpm quickstart` is an additive component to `dpm`; the core dpm functionality is not affected.

---

## **Milestones and Deliverables**

Months count from the grant start date. Grant Start Date will be the day immediately following the date the grant is approved.

### **Milestone 1: Current stack and standards**

- **Estimated Delivery:** 3.5 months from the start date (3.5 months)
- **Focus:** Move the whole stack to current versions and standards, with signing still inside the validator. Moonsong will coordinate closely with Digital Asset on architecture and best practices throughout Milestone 1.
- **Deliverables:**
    - A design note covering the architecture across remaining milestones, incorporating Digital Asset feedback as it arrives.
    - Splice and the Daml SDK upgraded to the target version defined.
    - Licensing contracts on Token Standard V2, with Traffic-Based App Rewards and contract keys.
    - A TypeScript backend in place of the Java one.
    - The observability stack removed, with debugging documented around lnav.
    - An updated React frontend that shows the flow on the new backend.
    - A Full License Lifecycle end-to-end test is passing in CI on the new stack.
    - Tagged release `uplift-m1`.
    - Documentation for changes to QuickStart and Milestone 1 completed features is available for the ecosystem.

### **Milestone 2: External signing, browser wallet & `dpm quickstart`**

- **Estimated Delivery:** 7 months from the start date (3.5 months)
- **Focus:** Move signing out of the participant and into the application. Move the App User's keys into the browser wallet, which completes the custody model CIP-0103 describes. Package QuickStart as a `dpm` component.
- **Deliverables:**
    - The backend holding both parties' keys through the Wallet SDK and signing externally.
    - External party onboarding and the prepare, sign, submit, and confirm flow in application code, replacing the shell-script guide.
    - The frontend connecting to a wallet through the dApp SDK (CIP-0103), including choices exercised by contract key.
    - The browser wallet extension will be used in the QuickStart signing flow. If the extension is not ready to be integrated (see "Dependency: Status, definitions and fallbacks" for details) , we will ship the flow on [`wallet-gateway-remote`](https://www.npmjs.com/package/@canton-network/wallet-gateway-remote).
    - The App User's keys are held in the selected wallet (browser extension or remote gateway), and the App Provider's keys are held in the backend.
    - The selected wallet replaces the Splice wallet UI in the flow and in the tests.
    - An end-to-end automated test covering external signing, passing in CI.
    - An end-to-end automated test covering wallet-mediated signing, passing in CI.
    - QuickStart packaged and published as a `dpm` component, with commands to manage the start and stop of LocalNet and facilitate project bootstrapping.
    - Tagged release `uplift-m2`.
    - Documentation for changes to QuickStart and Milestone 2 completed features is available for the ecosystem.

### **Milestone 3: Documentation, education, validation & adoption**

- **Estimated Delivery:** 10.5 months from the start date (3.5 months)
- **Focus:** Educate developers on the updated QuickStart and validate it with external teams. Fix issues identified through testing, and incorporate what we learn into the documentation and the “Gaps & Opportunities” Report. Moonsong Labs and Digital Asset will collaborate to make QuickStart the entry point for external organizations into the Canton ecosystem.
- **Deliverables / Value Metrics:**
    - Documentation for all new features is ready and available for developers in the ecosystem. Currently, 22 sections of Canton's [docs repository](https://github.com/canton-network/cf-docs) directly reference QuickStart, covering approximately 120 pages.
    - Maintain QuickStart to keep up with the latest versions of Splice, Canton, and Daml SDK throughout Milestone 3.
    - Developers from at least 10 organizations not affiliated with Moonsong Labs complete the QuickStart on LocalNet from start to finish and publicly confirm completion.
    - 3 external organizations use QuickStart as a reference in developing or prototyping a Canton application, with written confirmation or repo evidence identifying which QuickStart implementation patterns were reused.
    - Triage all M1/M2 issues identified through external testing, and resolve all issues that prevent completion of the documented QuickStart flow. Incorporate attendee feedback and recurring questions into the relevant documentation and the “Gaps & Opportunities” Report.
    - 3 walkthrough video tutorials that use QuickStart features to teach developers about Canton components and their applications in dApp development.
    - 1 webinar on the updated QuickStart to introduce new developers to the ecosystem.
    - 1 case study highlighting the work, learnings, and developer impact to be published on the Moonsong website.
    - A “Gaps & Opportunities” Report, covering issues and improvement ideas found across the ecosystem components QuickStart integrates. Each item is raised with the owning team and, where applicable, filed in its repository.
    - Tagged release `uplift-m3`.

---

## **Acceptance Criteria**

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness of the Quickstart.
- Public verification of published documentation, videos, and webinar.
- Public attestation of external developers and organizations about the Quickstart readiness and use.

---

## **Funding**

**Total Funding Request:** 12,950,000 CC

Moonsong Labs and Digital Asset are both contributing engineering resources as part of this effort. The full payment breakdown is below and reflects the contributions of each organization.

### **Payment Breakdown by Milestone**

While engineering effort is relatively evenly distributed across the three milestones, the payment schedule is intentionally weighted toward Milestone 3 to emphasize the importance of ecosystem adoption. A portion of the funding otherwise attributable to Milestones 1 and 2 has therefore been deferred to Milestone 3, aligning a greater share of the funding request with adoption outcomes. Payments within each milestone are split between Moonsong Labs and Digital Asset in proportion to their respective engineering contributions.

- Milestone 1:  3,850,000 CC upon committee acceptance, split:
    - Moonsong Labs: 2,750,000
    - Digital Asset: 1,100,000
- Milestone 2: 3,850,000 CC upon committee acceptance, split:
    - Moonsong Labs: 2,750,000
    - Digital Asset: 1,100,000
- Milestone 3: 5,250,000 CC upon committee acceptance, split:
    - Moonsong Labs: 3,750,000
    - Digital Asset: 1,500,000

### **Volatility Stipulation**

Assuming there are no scope extensions requested by the Canton Foundation, no volatility stipulation will be included in the proposal.

---

## **Co-Marketing**

Upon release of milestones, the implementing entities will collaborate with the Foundation on:

- Coordinated amplification across relevant Digital Asset, Foundation, and Moonsong channels
- Developer and ecosystem promotion through relevant community channels, newsletters, social media, and events

---

## **Motivation**

QuickStart is a strong entry point for new Canton developers. It provides a reference implementation of best practices, an introduction to the ecosystem, and a demonstration of Canton’s tools working together. Today, it lacks the newest standards & tools: it uses an outdated Splice release and validator-based signing, relies on Token Standard V1, and doesn't showcase newer developments such as traffic-based app rewards and browser wallet integration.

This gap costs teams time: developers learn patterns they later need to replace and encounter obstacles in their first steps. As a result, it takes longer to build a production-ready application and to onboard to the ecosystem.

### Why keeping QuickStart current matters

The [Q1 2026 developer survey tooling report](https://docs.google.com/document/d/1Bojx0Bep9qZiuo8e8cVdOWzeoZDBs1lNYOQsdOPQow4/edit?usp=sharing), the [Q1 Baseline Canton Developer Survey](https://docs.google.com/document/d/1igjlK1La2w1AxABr93xtya0_V6Aa_UUS2t0KG5sZ33g/edit?usp=sharing), and the [Canton Foundation Q2 2026 DevRel Survey](https://docs.google.com/document/d/1_2LaIJiYo3-6NHM1H1HqvTP1NFlhCH6Czr2yjV2Q_3k/edit?usp=sharing) show how developers use QuickStart today and what they expect from an exemplar app:

- **Current use.** QuickStart was the most-used tool in the Q1 tooling report (56% regular use). The Q2 survey reports regular use falling from 55% to 31%.
- **Gaps for developers who tried it.** In the Q1 tooling report, 25% of respondents had tried QuickStart but found it missing features. One developer in the Q1 survey said the QuickStart template “makes a lot of assumptions and has a lot of pre-configured users which makes understanding difficult,” and asked for an application where the onboarding and party association flow is clear. Milestone 2 replaces this with external party onboarding and the prepare, sign, submit, and confirm flow in application code.
- **Demand for an up-to-date exemplar app.** In the Q2 survey, Featured App Builders asked for a production-ready wallet-to-dApp starter kit covering PartyId provisioning and the prepare → sign → execute flow. Independent and community builders asked for end-to-end sample projects comparable to Ethereum’s ecosystem, and for step-by-step onboarding tutorials, especially for wallet integration. Milestone 2 delivers this flow on the Wallet SDK and dApp SDK, and Milestone 3 adds walkthrough video tutorials.

### Alignment with ecosystem goals

Updating [cn-quickstart](https://github.com/digital-asset/cn-quickstart) directly addresses [RFP 15](https://github.com/canton-foundation/canton-dev-fund/blob/d03ee272d11e1ca9106ef9696fba0ffe00acaa9b/2026-2028-strategic-roadmap.md?plain=1#L185) by providing current, practical, high-quality guidance that helps developers move from their first local run to a standards-aligned Canton application using available ecosystem components. The uplift has three objectives that align with RFP 15:

1. Reduce the time new teams need to build on Canton by shipping a current sample application and onboarding path they can run from a clean start.
2. Publish reusable public materials, including updated quickstart guides, a reference architecture, and documentation in the unified Canton docs, that show how application developers design, build, and test against current standards.
3. Onboard application developers and Featured App teams through workshops, exercises, and `dpm quickstart` so the patterns they copy match how Canton applications are built today.

Milestone 2 extends this alignment to two more RFPs:

- **RFP 14:** Give dApp teams a working example of wallet integration: external party onboarding, backend signing through the Wallet SDK, and user signing through a CIP-0103 wallet connected with the dApp SDK.
- **RFP 19:** Ship QuickStart as a `dpm` component with LocalNet start/stop and project setup, following DPM component conventions.

---

## **Rationale**

- We propose updating the current reference implementation for Canton QuickStart. A new repository would duplicate efforts and compete with an existing project in the ecosystem.
- Each tagged release runs and is useful on its own. Any tool built on QuickStart has a clear path to updates.
- The backend moves to TypeScript to follow ecosystem best practices. A TypeScript backend uses them directly, with no language bridge. Libraries Milestone 2 builds on, the Wallet SDK and the dApp SDK, are TypeScript packages.
- The App Provider stays on the backend. [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) separates wallets, user-facing dApps, and application backends, and lets backends keep direct ledger access.
- `dpm quickstart` puts the reference application one command away from where developers already work.
- Other funded or proposed work covers nearby ground: a [LocalNet manager](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-05-Denex-denex-localnet.md), a [dpm-based LocalNet devkit](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-05-BitDynamics-devkit.md), and a separate [dApp starter stack](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/bootnode-canton-dappbooster-dev-stack.md). Those are tools for building a dApp, while QuickStart is a working example. QuickStart can later add support for these tools to increase discoverability and converge tooling in the ecosystem.

---

## **Future Work**

These items depend on things that do not exist yet, so we leave them out of this grant and carry them into a follow-on proposal:

- **Self-signing JWTs** would let the backend authenticate to the ledger without running an identity provider such as the Keycloak instance QuickStart ships today. Upstream support is development-only today, using [HS256 with a shared secret](https://github.com/canton-network/wallet/blob/main/core/wallet-auth/src/self-signed-token-service.ts). The production form, with asymmetric keys the participant trusts, does not exist yet.
- **Consuming LocalNet from a pinned Splice release** instead of a vendored copy.
- **Starting up LocalNet with a pre-loaded state**, either from a snapshot or downloaded from a live validator of DevNet/TestNet/MainNet. Would allow testing a dApp against existing live contracts in a safe, local environment.
- **Using published Daml Script DARs** for test suites. This would avoid copying and pasting test suites all around and contribute to an ecosystem of shareable, standardized test suites.
- **Add support for available ecosystem tooling**, such as LocalNet management or dpm components.

The Milestone 3 “Gaps & Opportunities” report and feedback from external developers will set priorities for these items and may reveal other future needs. We anticipate a follow-on grant proposal will be submitted at the conclusion of this project covering both these future needs and further ongoing maintenance to ensure QuickStart remains updated.

---

## **Team and Credibility**

Moonsong Labs and Digital Asset together are uniquely positioned to carry out this grant for the Quickstart Uplift:

- **Digital Asset currently owns and maintains CN QuickStart.** The work ships in [digital-asset/cn-quickstart](https://github.com/digital-asset/cn-quickstart). This brings distribution, discoverability, and community trust, with a credible commitment to maintain it long-term. Experience, reviews, and direction ensure that the QuickStart leverages the best practices in the ecosystem.
- **Moonsong Labs brings the engineering depth & experience to advance it.** With a strong understanding of current ecosystem tooling and available resources, our team is well positioned to combine Canton experience with prior work shipping developer tooling, dApps, and infrastructure across a number of ecosystems including Ethereum, ZKsync, Solana, and Polkadot.

**Together, we can meaningfully improve QuickStart and make it the gold-standard reference app that teams and new developers use as their starting point.** It will showcase a best-practice architecture built on available Canton components, strengthening every app built based on this reference implementation.  

---

## **Maintenance and Sustainability**

**Sustainability**

- Work will be developed in `digital-asset/cn-quickstart` under its existing [0BSD license](https://github.com/digital-asset/cn-quickstart/blob/main/LICENSE).
- Documentation for upgrades and new features will be delivered in Milestone 3.
- The `dpm quickstart` component lives in the same repository and is released with it.

**Maintenance**

- Throughout the milestone duration, maintain and update the Splice & DAML version, and keep it up to date with the latest releases.
- Proposals to keep the QuickStart updated and add features will be done as a subsequent completion of this proposal, using the “Gaps & Opportunities” report as input for informed prioritization.