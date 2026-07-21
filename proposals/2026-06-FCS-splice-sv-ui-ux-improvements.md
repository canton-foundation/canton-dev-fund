## Development Fund Proposal

**Author:** Finoa Consensus Services GmbH  
**Status:** Draft  
**Created:** 2026-06-10  
**Category:** Ecosystem maintenance and core code health  
**Label:** splice-sv-ui-ux-improvements  
**Champion:** \[Required: SIG or Tech & Ops Committee sponsor\]

---

## Abstract

Finoa Consensus Services GmbH requests **393,000 Canton Coin (CC)** to deliver **18 selected open issues** from the `canton-network/splice` repository. The work targets three practical areas where external contribution can create immediate ecosystem value: **SV governance UI shared component library**, **SV governance UI layout and page design**, and **SV governance UI functionality improvements**.

As of June 2026, the Splice repository has **868 open issues** across active milestones. The SV UX improvements milestone stands at **42% complete** with multiple open items across UI components, governance pages, and operator-facing functionality. Bundle A selects **8 component issues plus the Initiate Proposal page** (Milestone 1), **4 layout and page design issues** (Milestone 2), and **5 governance functionality issues** (Milestone 3), for a total of **18 in-scope issues**.

This proposal gives Digital Asset and the Splice core maintainers a practical way to move useful maintenance work forward without distracting from larger protocol, platform, and roadmap priorities. FCS will contribute review-ready pull requests upstream, including tests, documentation updates, validation where applicable, and milestone reporting. The result should be a more complete and consistent SV governance UI, reduced friction for SV operators, and a cleaner shared codebase.

The scope is intentionally narrow. It does not introduce new protocol scope, take over Digital Asset roadmap ownership, or create parallel infrastructure. The selected issues are already filed and milestoned, keeping the grant reviewable, maintainer-aligned, and directly tied to existing repository needs.

---

## Specification

### 1\. Objective

The objective is to deliver a coherent basket of UI component, design, and governance-functionality items across the SV governance UI surface in `canton-network/splice`.

The project includes:

- **Shared UI component library:** implementing the remaining Look & Feel components (ActionSelection, Dropdown, RadioSelector, TextArea, TextInput, ConfigurationEntry, Accordion, JsonDiff) that the SV governance UI depends on, sequenced first as they unblock the page-level work.  
- **Layout and page design:** completing the SV UI Layout component, the Governance Initiate Proposal page, the Proposal Review page final look and feel, URL refinement across the SV UI, and scrollable names and IDs.  
- **Governance functionality:** correcting the "Created at" field display, adding a "Submitted by" column to governance tables, fixing disabled-field input, implementing migration ID validation, adding a search window, and implementing migration ID validation.  
- **Upstream collaboration:** pull requests against `canton-network/splice`, aligned with the relevant issue and milestone.  
- **Validation:** testing and validation against an FCS SV governance deployment where applicable before maintainer review.

Explicit non-goals:

- Protocol-level changes to Canton itself.  
- Backend API changes beyond what individual issues require.  
- Full SV UI visual redesign beyond the scoped issues.  
- Work already labelled `now` and assigned to a Digital Asset engineer.

### 2\. Implementation Mechanics

The work is organized into three workstreams. Each issue will be delivered as one or more pull requests against `canton-network/splice`, referencing the originating issue and this grant. The shared component workstream is sequenced first as its output is a direct dependency for the page-level work that follows.

| Workstream | Scope |
| :---- | :---- |
| **SV UI Shared Component Library** | 9 issues covering the remaining Look & Feel components plus the Initiate Proposal page that composes them. |
| **SV UI Layout and Page Design** | 4 issues covering the Layout component, the proposal review page, URL refinement, and scrollable names/IDs. |
| **SV UI Governance Functionality** | 5 issues covering data display corrections, table additions, input fixes, validation, and search. |

### 3\. Architectural Alignment

This proposal aligns with Canton and Splice architecture because it contributes directly to `canton-network/splice`, uses already-filed and milestoned issues, and does not create parallel infrastructure. The work is contained to the `governance-beta` React frontend and its shared component library and does not touch Canton protocol, Daml models, or backend API surface beyond what individual issues require. The output will follow the repository's existing open-source licensing model.

FCS brings production context from operating an SV node and the governance UI daily, giving the team direct experience with the operator-facing needs these issues address before review.

### 4\. Backward Compatibility

Changes will be backward compatible where possible. The work is additive at the UI layer; no existing API contracts, Daml models, or protocol messages are modified. Documentation will be updated alongside any user-visible behavior changes.

---

## Milestones and Deliverables

### Milestone 1: SV UI Shared Component Library

- **Reviewed and accepted by Splice maintainers:** target 3 weeks after grant approval (Digital Asset's day-level estimate for this milestone already accounts for review)  
- **Scope:** the remaining Look & Feel components plus the Initiate Proposal page that composes them, estimated using Digital Asset's own day-level estimates.  
- **Value metrics:** each component matches the established SV UI design system and is covered by a basic render test; all 8 components are available for use by the page-level issues in Milestone 2\.  
- **Definition of done:** the in-scope pull requests are reviewed and accepted by the Splice maintainers.

**GitHub pull requests submitted for:**

- [\#2654 SV UI Redesign Look & Feel: Component: ActionSelection](https://github.com/canton-network/splice/issues/2654)  
- [\#2652 SV UI Redesign Look & Feel: Component: Dropdown](https://github.com/canton-network/splice/issues/2652)  
- [\#2655 SV UI Redesign Look & Feel: Component: RadioSelector](https://github.com/canton-network/splice/issues/2655)  
- [\#2656 SV UI Redesign Look & Feel: Component: TextArea](https://github.com/canton-network/splice/issues/2656)  
- [\#2657 SV UI Redesign Look & Feel: Component: TextInput](https://github.com/canton-network/splice/issues/2657)  
- [\#2659 SV UI Redesign Look & Feel: Component: ConfigurationEntry](https://github.com/canton-network/splice/issues/2659)  
- [\#2660 SV UI Redesign Look & Feel: Component: Accordion](https://github.com/canton-network/splice/issues/2660)  
- [\#2661 SV UI Redesign Look & Feel: Component: JsonDiff](https://github.com/canton-network/splice/issues/2661)  
- [\#2623 SV UI Redesign Look & Feel: Page: Governance (Initiate proposal)](https://github.com/canton-network/splice/issues/2623)

### Milestone 2: SV UI Layout and Page Design

- **Reviewed and accepted by Splice maintainers:** target 5 weeks after grant approval (includes a one-week maintainer review and acceptance allowance)  
- **Scope:** 4 issues covering the Layout component, the proposal review page, and URL and navigation polish.  
- **Value metrics:** the Initiate Proposal and Proposal Review pages render correctly using the Layout component and the components delivered in Milestone 1; URLs are consistent and names/IDs are scrollable throughout the SV UI.  
- **Definition of done:** the in-scope pull requests are reviewed and accepted by the Splice maintainers.

**GitHub pull requests submitted for:**

- [\#2594 SV UI Redesign Look & Feel: Component: Layout](https://github.com/canton-network/splice/issues/2594)  
- [\#3023 Final look and feel for proposal review page in SV UI](https://github.com/canton-network/splice/issues/3023)  
- [\#3022 Refine URLs across SV UI app](https://github.com/canton-network/splice/issues/3022)  
- [\#1785 Make names and IDs scrollable in UI](https://github.com/canton-network/splice/issues/1785)

### Milestone 3: SV UI Governance Functionality

- **Reviewed and accepted by Splice maintainers:** target 6 weeks after grant approval (includes a one-week maintainer review and acceptance allowance)  
- **Scope:** 5 issues covering data display corrections, table improvements, input validation, and search.  
- **Value metrics:** a current SV operator can complete the governance workflows covered by these issues end to end in the governance-beta UI without encountering the previously reported bugs or missing fields.  
- **Definition of done:** the in-scope pull requests are reviewed and accepted by the Splice maintainers.

**GitHub pull requests submitted for:**

- [\#3453 Correct "Created at" field display in governance-beta UI](https://github.com/canton-network/splice/issues/3453)  
- [\#3691 Add "Submitted by" column in all new governance tables](https://github.com/canton-network/splice/issues/3691)  
- [\#5650 Disabled fields cannot be set in the UI](https://github.com/canton-network/splice/issues/5650)  
- [\#2451 Implement validation for nextScheduledSynchronizerUpgradeMigrationId config field](https://github.com/canton-network/splice/issues/2451)  
- [\#3025 Add a search window to SV UI](https://github.com/canton-network/splice/issues/3025)

---

## Delivery and Acceptance Model

Each milestone is complete when its in-scope pull requests are reviewed and accepted by the Splice maintainers. The milestone week estimates include both build time and an allowance for the maintainer review and acceptance cycle. This follows guidance from the Splice maintainers that milestones should reflect work that is reviewed and accepted, not only submitted.

A milestone is considered delivered when:

- The in-scope pull requests are reviewed and accepted by the Splice maintainers.  
- PRs reference the originating GitHub issue and this grant.  
- Tests and documentation are included where relevant.  
- CI checks pass on the accepted PRs.  
- A short milestone report lists the accepted PRs, validation performed, and scope changes, if any.

If review feedback materially changes accepted scope, introduces new requirements, or requires architectural rework beyond the original issue scope, the affected milestone timeline pauses until the revised scope is agreed.

---

## Funding

**Total Funding Request:** **393,000 CC**  
**Reference rate:** **1 CC \= USD 0.15**  
**Implied USD amount:** **USD 58,950**

The request covers 18 in-scope issues across three milestones. Milestone 1 is estimated using Digital Asset's own day-level estimates for the Initiate Proposal page and its components, which already account for review; Milestones 2 and 3 use FCS engineering estimates with a separate review cycle. The rates below are all-in commercial planning rates covering implementation, testing, documentation, review preparation, coordination, reporting, and delivery accountability for the agreed scope. Consolidated written feedback is required per review cycle. Changes that materially exceed the agreed milestone scope are billed at the stated hourly rate.

### Cost Build-up

| Workstream | Delivery hours | All-in planning rate | Calculation | USD total | CC equivalent |
| :---- | ----: | ----: | :---- | ----: | ----: |
| Developer implementation (build) | 122 | $300/h | 122 × $300 | $36,600 | 244,000 CC |
| Review cycle | 61 | $300/h | 61 × $300 | $18,300 | 122,000 CC |
| Project management and coordination | 18 | $225/h | 18 × $225 | $4,050 | 27,000 CC |
| **Total request** | **201** | n/a |  | **$58,950** | **393,000 CC** |

### Payment Breakdown by Milestone

Project management hours are allocated proportionally by developer hours per milestone.

| Milestone | Build hours | Review hours | PM hours | USD amount | CC amount |
| :---- | ----: | ----: | ----: | ----: | ----: |
| Milestone 1: SV UI Shared Component Library | 92 | 46 | 14 | $44,550 | 297,000 CC |
| Milestone 2: SV UI Layout and Page Design | 12 | 6 | 2 | $5,850 | 39,000 CC |
| Milestone 3: SV UI Governance Functionality | 18 | 9 | 2 | $8,550 | 57,000 CC |
| **Total** | **122** | **61** | **18** | **$58,950** | **393,000 CC** |

### Volatility Stipulation

The project is expected to complete within 8 weeks of grant approval (the Milestone 3 target of 6 weeks plus a short buffer), inclusive of build and the maintainer review and acceptance cycles. If committee-requested scope changes push the remaining work materially beyond that window, remaining milestone funding should be renegotiated to account for USD/CC volatility.

---

## Rationale

The selected basket is well suited for external contribution because it is already filed and milestoned, touches practical operator-facing surfaces, and can be delivered through normal upstream PRs. The grant therefore funds implementation, testing, and review-ready delivery rather than a new design track.

The sequencing of shared components before pages before functional items is deliberate. Several page-level and functional issues depend on the component library landing first. Delivering in dependency order reduces the chance of PRs blocking each other and minimises the review surface the maintainers need to handle at any one time.

Bundling the work into one proposal reduces committee overhead, lets FCS reuse context across related fixes, and creates a clear proof point for using the Development Fund to support upstream code health without creating parallel infrastructure.

---

## Team & Qualifications

Finoa Consensus Services GmbH (FCS) is the applicant and delivery owner. FCS is a German-incorporated, AAA-rated digital asset infrastructure firm securing hundreds of millions of dollars in validator services.

### Daml & Canton Experience

The FCS team created and maintains Vala Wallet, giving us hands-on experience in Daml smart contract development, Canton node integration, and production-grade application delivery. We also built and maintain Tokino, a Daml-based CC locking application on Canton. Halborn security audits for both Canton Featured Apps, Vala Wallet and Tokino, are available to the committee upon request.

### Infrastructure & Validator Operations

As a Node-as-a-Service operator, FCS operates a validator footprint on Canton supporting 15+ customer validators on the network. FCS participates in SV governance as an operator and uses the governance UI daily, giving the team direct experience with the operator-facing needs that the issues in this basket address.

### Liquid Staking Expertise

FCS operates 7,000+ Ethereum validators for leading liquid staking protocols like EtherFi, Lido or Swell.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| Maintainer review or merge queues delay final merge | Medium | Medium | Measure FCS delivery at review-ready PR submission, keep PRs small, and maintain clear review communication. |
| Component design decisions require sign-off from a designer not always available | Medium | Medium | Raise design questions per issue before coding starts; treat the maintainer-accepted issue description as the design spec where no other reference exists. |
| Page-level issues blocked until component PRs are reviewed and merged | Medium | Medium | Sequence PRs to minimise wait time; start page work in a branch that can be rebased once components land. |
| Review feedback materially expands scope | Medium | High | Pause the affected milestone timeline until revised scope is agreed. |
| Scope expands beyond the selected basket | High | High | Keep a hard cap at the 18 selected issues and track adjacent items separately. |
| Product priorities compete with grant work | Medium | Medium | Use a fixed engineering and PM allocation; milestone targets are based on that allocation. |

---

## Ecosystem Impact

This work strengthens the shared Splice codebase and gives the core team additional support on governance UI quality.

- **SV operator usability:** the SV governance UI is the primary interface through which all SV operators manage their nodes and participate in governance. Completing the component library and functional gaps reduces daily friction for every operator on the network.  
- **Governance quality:** accurate "Created at" and "Submitted by" attribution, and correct disabled-field handling reduce the risk of governance errors caused by missing or misleading UI information.  
- **Contributor model:** a reviewable, milestone-driven delivery shows how the Development Fund can support upstream maintenance without creating parallel infrastructure.

---

## Maintenance and Sustainability

The output of this grant will live in the existing `canton-network/splice` repository. Merged PRs become part of the maintainer-owned codebase and inherit the existing Splice maintenance posture. No new repositories, packages, or maintenance grants are created by this proposal.

FCS will continue to engage with the contributed work as part of its ongoing SV governance operations and will respond to follow-up bugs or regressions traced to its contributions on a best-effort basis after milestone acceptance.

---

## Open Source and Licensing

All software deliverables will be contributed under Apache 2.0 to the relevant open-source repositories. Any CIP text will be submitted under the standard licensing used by the `canton-foundation/cips` repository.

