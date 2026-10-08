## Development Fund Proposal

**Organization:** Digital Asset

**Author / Primary Contact:** Itai Segall

**Status:** Draft

**Created:** 2026-09-21

**Proposal Type:** RFP-aligned

**RFP / Roadmap Area:** Governance, Identity & Network Coordination

**Champion:** Itai Segall

**Total Funding Request:** 1,000,000 CC

**Project Duration:** 22 weeks

**Label:**
- onchain-governance

---

## Abstract

Today, on-chain SV governance is tightly coupled with node
operations. Every node has a single on-ledger vote, and only the
SV operator party can submit votes (and vote requests) on behalf of that
node. This introduces operational complexities for SV operators (who often
need to seek vote approval from an individual representing an SV rights owner),
as well as a security risk by reusing the same operator (internal) party for
all votes.

This proposal introduces a mechanism through which (external) parties
can be delegated by the node operator to be able to vote on behalf of the node,
and a dApp UI through which they can perform votes. The delegee can choose to
host their own dApp UI, or use one hosted by the SV node for them. This
proposal takes over the remaining work out of `2026-04-Avro-SV_Governance_dApp`, which was discontinued after
delivering Milestone 2. The starting point for this proposal is therefore M2
in the above referenced proposal.

---

## Specification

### 1. Objective

Develop and deliver a mechanism for an SV node operator to delegate SV
governance voting to non-operator parties, which may also be an external party
and hosted on a different validator node, and a dApp for them to do so.
While this is a step toward separating governance from node operations, this proposal intentionally
does not modify the voting rights (which remain one vote per Super Validator node). This proposal only adds an additional
party that is allowed to vote on behalf of the node, plus the capability for that party to use
any CIP-103 compliant wallet provider to do so via a governance dApp.

The proposal is compatible with any future expansion of voting to all Super Validator rights owners, as suggested in CIP Governance proposals [raised previously here](https://lists.sync.global/g/cip-discuss/topic/119218581?msg=828#msg828).

### 2. Implementation Mechanics

This proposal will be implemented via changes in various components of Splice, as follows.

#### Daml

Complete the introduction of a voting delegation workflow. A node operator may delegate
governance voting to any party. The contract is a standard Daml delegation contract, where
the node operator permits a certain "voter party" to vote on behalf of the node. It does
not affect the operator's ability to vote, only adds a workflow in which the voter party
may also submit votes and vote requests, which are registered on-ledger as the node's votes
(with a public record that they were submitted via the delegation).

To be explicit, this is the same Daml code funded in M2 of the previous grant mentioned
above, and available in the [feature fork](https://github.com/canton-network/splice-sv-voting-dapp/commit/00a2bad8825e62a48096d780421411df6ea92b20#diff-d109e7b29a999dd8e985074e683c151f7fc922eb6e8297d4d7150e475ccb5f4f) already.
The funding in this grant includes only a final round of review of this Daml code, and hardening for
production readiness, plus the work for preparing and submitting the CIP required for the code
changes to be adopted, which was not completed under the previous grant.

#### Governance dApp

The existing SV UI is tightly coupled with the SV node operator, and is usable only with
a user that has act-as rights for the SV node operator's party. Moreover, that party must
be a participant-internal party. This grant will introduce a governance dApp that would
allow a user with rights on the voter party to submit the votes using the delegation via
any CIP-103 compliant wallet.

The dApp does not assume any access to the SV app's APIs.
The read path uses Scan APIs for fetching data, and the write path goes via any CIP-103
compliant wallet to any participant that hosts the voter party.

The SV UI implementation will be refactored to support both modes:
- When deployed in "non-dapp" mode, it will retain the current behavior.
- When deployed in "dapp" mode, it will:
  - Use scan for the read path and CIP-103 wallet APIs for the write path.
  - Hide functionality that is not relevant/supported for voter parties, like
    issuing secrets for onboarding validators, and coin-price related functionalities.
  - Hide/disable other functionalities that are clearly intended for node operators
    only, e.g. specific configuration parameters that affect only the node operations.
    The precise details for which functionality is included under this item will be
    determined as part of implementation, and will be easily modified over time as
    the needs change.
  - Support a single voter party having delegations to vote on behalf of different nodes.

Note that in terms of implementation, in order to minimize discrepencies between the two,
and support long-term maintenance of both, a single implementation will support both operating modes.
At deployment time, the operator hosting the UI will configure in which mode it runs.

Since the dApp mode of the UI does not rely on connectivity to the SV app, it may be hosted
either by the node operator (alongside the UI they host for themselves as operators), or
independently by the voter (or by a 3rd party on their behalf). Both options will be
supported, tested and documented.

#### Deployment

A new Helm chart will be introduced for hosting the SV UI in dApp mode, and will be available
for both SV node operators, as well as other operators, to run on behalf of voters. Documentation
for hosting by any operator will be provided.


### 3. Architectural Alignment

This proposal aligns with multiple initiatives in the canton ecosystem, namely:

- Improving governance processes by allowing business owners to participate directly in
  on-ledger governance without relying on SV node operators to cast votes on their behalf.
- Improving security by separating concerns, and allowing users and parties with well-defined
  responsibilities and permissions to act.
- Reducing reliance on internal parties, and increasing support for external parties acting
  via CIP-103 compliant wallets.

### 4. Backward Compatibility

This proposal is fully backward compatible. It is a pure incremental functionality,
which adds the ability for an external voter to vote on bahelf of the node. All available
functionalities for the node operator are untouched and unaffected in this proposal.

---

## Milestones and Deliverables

### Milestone 1: Community Acceptance
- **Estimated Delivery:**
  - The CIP will be submitted for review within 2 weeks after grant approval.
  - Payment will be due after acceptance of the CIP, not at a specific date, or forfeited if the CIP is not accepted within 6 months of grant approval.
- **Focus:**
  - Core functionality implemented in Daml, and accepted by the community via a CIP
- **Deliverables / Value Metrics:**
  - Daml code is complete enough to be voted on in a CIP
  - CIP written, submitted and accepted
  - Note that Milestone 1 and Milestone 2 will be delivered in parallel, and may be completed in any order.

### Milestone 2: Production Readiness
- **Estimated Delivery:**
  - 12 weeks after grant approval
- **Focus:**
  - Full development, testing and documentation of the feature
- **Deliverables / Value Metrics:**
  - Complete implementation, hardening and testing, including:
    - Add support and documentation for node operators to configure their voting delegates
      as part of their deployment.
    - Add support and documentation for SV node operators, or any other hosting service,
      to host the voting UI for the voting delegates.
    - Add support for a single party being the governance voting party for more than
      one SV node.
      The user can choose on behalf of which node they are voting.
    - SV dApp UI supports the `governance` tab from the existing SV UI,
      but hides all other functionality (which is either broken or irrelevant
      for voting parties).
    - Identify the parameters in votes that are clearly node operations-specific,
      and hide/disable changing them via the dApp UI.
    - Happy-path and error-path testing complete, code is production-ready
    - SV dApp UI submits all transaction via standard CIP-103 wallet APIs, and tested
      against at least two standard-compliant wallets, e.g. the Wallet Gateway.
  - Functionality is presented and demonstrated to the SV node operators.
  - Deployment and usage fully documented in the canton-network public documentation.
  - All code is merged into Splice main, or to a final feature branch if the CIP is not yet approved,
    and ready for release.

### Milestone 3: Rollout and Adoption
- **Estimated Delivery:**
  - We estimate this will be completed around 22 weeks after grant approval.
  - Payment will be due after enabling on MainNet and demonstrating acceptance, not at a specific date, or forfeited if the acceptance criteria are not met within 12 months of grant approval.
- **Focus:**
  - Rollout of the feature across all networks, and availability to all SVs.
- **Deliverables / Value Metrics:**
  - Daml Model versions are voted in on DevNet, TestNet and MainNet, and the feature is
    available for use by SV nodes.
  - Demonstrated to work on MainNet by at least one vote or vote request casted by a delegate via the dApp
    (as will be visible in the update history from Scan).

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project specific criteria include adoption and usage by at least two SV node operators,
as detailed in Milestone 3 deliverables above.

---

## Funding

**Total Funding Request:** 1,000,000 CC

Payment Schedule:

| Milestone | Amount (CC) | Trigger | Recipient |
| 1 - Community Acceptance | 250,000 | Committee acceptance of deliverables | Digital Asset |
| 2 - Production Readiness | 500,000 | Committee acceptance of deliverables | Digital Asset |
| 3 - Rollout and Adoption | 250,000 | Committee acceptance of deliverables | Digital Asset |


### Volatility Stipulation

This grant is denominated in fixed Canton Coin.
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

---

## Motivation

This proposal is a concrete next step in the path toward decoupling SV node operations
from governance. It is a well-defined concrete step that allows organizations to already
decouple these responsibilities, without yet touching the core governance questions of
weighted votes, rewards, etc. As such, it improves operational processes in SV organizations
in a purely additive manner.

---

## Rationale

dApps are the standard method for supporting external parties acting on the Canton Network.
Therefore, designing the voting app as a dApp enables that. The delegation process allows
adding another party that can act on behalf of the node in the context of voting, but does
not subtract any existing functionality from the operator party. This allows this proposal
to be tightly scoped and low-risk.
