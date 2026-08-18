## Development Fund Proposal

**Author:** IntellectEU  
**Status:** Draft  
**Created:** 2026-06-23  
**Label:** onchain-governance

**Champion:** Itai Segall


---

## Abstract
Multiple Super Validator Right Owners can host their weights on a single Super Validator Node.
The weights of these SV Right Owners are combined and represented on-ledger under the name of the SV Node Operator.

The management of SV Right Owners, along with their weights and beneficiaries happens entirely off-ledger.
Not only does this not take advantage of the transparency and trust provided by the ledger but the process of
applying changes is slow, cumbersome and must happen serially.

This proposal moves management of SV Right Owners, their weights and beneficiaries onto the ledger.

---

## Specification

### 1. Objective
Align the Daml ledger model with current practices when it comes to the management of SV Right Owners and their beneficiaries.

At the moment things work as follows:

- SV Nodes are represented on ledger with a weight assigned to them
- Each SV Node keeps a configuration (off-ledger) of their SV Right Owners and their beneficiaries (including the weights)
- For coupon creation, each SV Node uses the beneficiaries mechanism present in the Daml model to create coupons
for their SV Right Owners and their beneficiaries with weights derived from their off-ledger configuration
- Adding or removing a new SV Right Owner involves the SV Node requesting a vote on changing its own reward weight, 
and then the node operator updating the off-ledger configuration of beneficiaries of the node.
- All other SVs need to configure their off-ledger configuration of the total weight of the node, which
is used for re-onboarding in case offboarding is required for any reason.

Crucially, SV Right Owners and beneficiaries are not represented on ledger.

Goals include:

- Represent every SV Right Owner, their weight and beneficiaries in the Daml ledger model
- Eliminate the off-ledger weight configuration
- SV Right Owner onboarding, offboarding and weight update requires approval from the SV Nodes
- The weights of any SV Right Owners can be updated independently and in parallel
- An SV Right Owner must only be able to mint rewards if its SV Node and beneficiaries participate in the minting workflow for that round
- SV Right Owners should be able to manage their own beneficiaries without requiring approval or voting of other SVs.
- Migration from the legacy to the new model should invalidate the legacy SV coupon creation flow
- Migration should not result in any loss or duplication of rewards

### 2. Implementation Mechanics
#### Introduction
We will represent each SV Right Owner on the ledger along with its reward weight and beneficiaries (along with the proportion of rewards each beneficiary should receive).
To change the reward weight of an SV Right Owner, an SV vote is required.

This will completely replace the `extraBeneficiaries` off-ledger configuration.

If a node operator is an SV Right Owner itself, it will also be represented as an SV Right Owner on its own node,
with its weight managed in the exact same way as all other SV Right Owners.

After the migration to the new model, SV Nodes will no longer have any weight associated to them directly.

#### SV Right Owner Management
A UI will be provided such that an SV Right Owner admin user is able to:

- View information about its SV Right Owner status
- Manage its beneficiaries

This will be supported by choices in the Daml model.

Both the SV UI and Scan UI will be extended to include information about SV Right Owners,
supported by an endpoint to be added to the Scan API.

A few voted actions will be added to the Daml model and the SV UI to allow managing SV Right Owners in at least the following ways:

- Onboard a new SV Right Owner
- Update SV Right Owner reward weight
- Offboard an SV Right Owner
- Migrate an SV Right Owner to a different SV Node

#### Coupon Creation
SV Reward Coupons will continue to be created by each SV Node on behalf of SV right owners hosted on that node for reward minting.
One `SVRewardCoupon` per round will be created for each beneficiary of each SV Right Owner (plus one for the SV Right Owner itself if there is leftover weight).

`DsoRules` will be extended with a choice to do this.
There will be contracts tracking the reward collection state for the SV Right Owners to ensure
no double dipping happens.

Within an SV Right Owner, it will be guaranteed by the Daml model that each beneficiary gets at most one `SVRewardCoupon` per round and with the correct weight.
Making sure that each such coupon actually gets created will _not_ be enforced by the Daml model (it is possible for a malicious SV Node or in the case of an SV outage that no coupons are created).

No UI changes are expected regarding coupon creation.

#### Migration
There will be a choice provided in `DsoRules` with a corresponding vote to allow migration from the old model to the new. The migration does not require any action on the side of existing beneficiaries. The reward minting flow on their side is unchanged.

This migration voted action will be made available in the voting UI.

#### Changes to SV Node Onboarding Flow
Since SV Nodes will no longer have any weight associated with them, it is proper that the onboarding flow changes to reflect this.
We expect only minor changes to the codebase to reflect the fact that we no longer have reward weight associated with SV Nodes.

In the typical case of a new SV Node with some associated reward weight, the onboarding will be done in two steps:

1. The SV Node is onboarded (with no weight attached to them)
2. We onboard them as an SV Right Owner

The offboarding process will be similar to the onboarding flow.
We will reuse as much as possible and decouple SV Node / SV Right Owner offboarding.

#### Note
Many or most of these flows require additional changes to the various backend services,
mainly triggers to further the new flows along.


### 3. Architectural Alignment
Our proposal:

- Enhances transparency and verifiability on ledger, reducing trust requirements
- Preserves and reuses as much as possible the existing flows
- Is fully backward compatible
- Has an easy migration path
- Makes it much easier to perform governance operations related to SV Right Owners
- Is more decentralized as the SV Right Owners can now control their own beneficiaries
- Enables further developments such as weight-based voting or automated flows to scale down SV Right Owner weights (for example in the context of [CIP 105](https://github.com/canton-foundation/cips/blob/main/cip-0105/cip-0105.md#phase-2--on-chain-enforcement))


### 4. Backward Compatibility
All of the changes should be backward compatible.
The system can continue operating at all points in time.


---

## Milestones and Deliverables
### Milestone 1: CIP and Daml Draft
- **Estimated Delivery:** +10 weeks from DFP approval
- **Focus:** Implement the Daml Draft and the CIP
- **Deliverables / Value Metrics:**
  - Daml PR with a draft implementation approved by Splice core maintainers.
  - CIP submitted
  - CIP approved

### Milestone 2: Implementation
- **Estimated Delivery:** +33 weeks from DFP approval
- **Focus:** Deployment on MainNet
- **Deliverables / Value Metrics:**
  - Merge a series of PRs with the functionality
  - Deployment to DevNet
  - Migration to the new model on DevNet
  - Manual testing in DevNet
  - Deployment to TestNet
  - Migration to the new model on TestNet
  - Deployment to Mainnet
  - Migration to the new model on MainNet

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

---

## Funding
**Total Funding Request:** 1,224,000

### Payment Breakdown by Milestone
- Milestone 1 CIP and Daml Draft: 300,000 CC upon committee acceptance
- Milestone 2 Main Functionality: 474,000 CC upon committee acceptance
- Milestone 3 SV Node Onboarding: 450,000 CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, IntellectEU will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

---

## Motivation
SV Right Owner weight being completely off-ledger has at least a few problems:

- Onboarding, offboarding or changing weight for SV Right Owners is a laborious process. It requires voting to change the SV Node's weight and then an off-ledger configuration change on that SV Node.
- Onboarding, offboarding or changing weight for SV Right Owners can only happen sequentially for each SV Node.
We have to wait for the voting to be complete before requesting another SV Node weight change.
- Full trust of SV Nodes is required when it comes to managing their SV Right Owners. Each SV Node can arbitrarily change their reward allocation every round.
- SV Right Owners have to bother their SV Node to have them change their off-ledger configuration when managing their beneficiaries.
- Further developments that rely on SV Right Owner weight are currently hard to implement (e.g. weighed voting or automatic weight updates)
- SV Right Owners and their weights are not visible publicly in block explorers and in Scan APIs.


This proposal solves all of these issues and provides a strong base for further developments involving SV weight and rewards.

---

## Rationale
This approach is broadly in line with existing conventions, reuses what exists as much as possible and is fully backward compatible with an easy migration path.

The possibility of storing the SV Right Owner info in DsoRules itself rather than having separate contracts was considered.
This has the disadvantage of increasing contention for DsoRules, which might become significant if,
for example, further developments around automated weight updates become a reality.

Having a bulk choice/vote to add/remove/update was also considered but decided against because
it makes votes harder to reason about and is less aligned with the existing conventions in splice.
