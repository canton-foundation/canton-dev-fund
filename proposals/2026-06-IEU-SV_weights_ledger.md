## Development Fund Proposal

**Author:** IntellectEU  
**Status:** Draft  
**Created:** 2026-06-23  
**Label:** onchain-governance

**Champion:** Jonathan Mayeur


---

## Abstract
Currently the management of Hosted SVs, along with their weights and beneficiaries happens entirely off-ledger.
Not only does this not take advantage of the transparency and trust provided by the ledger but the process of
applying changes is slow, cumbersome and must happen serially.

This proposal moves management of Hosted SVs, their weights and beneficiaries onto the ledger.

---

## Specification

### 1. Objective
Align the Daml ledger model with current practices
when it comes to the management of Hosted SVs and their beneficiaries.

At the moment things work as follows:

- SV Nodes are represented on ledger with a weight assigned to them
- Each SV Node keeps a configuration (off-ledger) of their Hosted SVs and their beneficiaries (including the weights)
- For coupon creation, each SV Node uses the beneficiaries mechanism present in the Daml model to create coupons
for their Hosted SVs and their beneficiaries with weights derived from their off-ledger configuration
- Adding or removing a new Hosted SV involves the SV Node requesting a vote on changing its own reward weight
and updating its off-ledger configuration.

Crucially, Hosted SVs and beneficiaries are not represented on ledger.

Goals include:

- Represent every Hosted SV, their weight and beneficiaries in the Daml ledger model
- Hosted SV onboarding, offboarding and weight update requires approval from the SV Nodes
- The weights of any Hosted SV nodes can be updated independently and at the same time
- A Hosted SV must only be able to mint rewards if its SV Node and beneficiaries participate in the minting workflow for that round
- Hosted SVs should be able to manage their own beneficiaries
- Migration from the legacy to the new model should invalidate the legacy SV coupon creation flow
- Migration should not result in any loss or duplication of rewards
- Migration of each SV Node should be independent

### 2. Implementation Mechanics
#### Introduction: `HostedSv` and Reward Weight
The main template we will add is `HostedSv`, signed by the `dso` party.
This new template represents an SV hosted by an SV Node and includes
things such as its weight and beneficiaries (along with the proportion of rewards each beneficiary should receive).

A collection of these templates will replace the `extraBeneficiaries` off-ledger config,
with each Hosted SV getting one `HostedSv` contract and a Hosted SV beneficiary getting an entry in `HostedSv.beneficiaries`.

In addition, each SV Node will get its own `HostedSv` as well, with the weight being the difference
between the weight in its `DsoRules.svs` entry and the sum of all the weights in the `extraBeneficiaries`.

All weight information will then be in the `HostedSv` contracts.
`SvInfo.svRewardWeight` will be deprecated and set to zero.

#### Hosted SV Management
The Wallet UI will be extended such that the user is able to:

- View information about its Hosted SV status
- Manage its beneficiaries

This will be supported by choices in the Daml model and additional endpoints to be added to the Validator API.

Both the SV UI and Scan UI will be extended to include information about existing Hosted SVs,
supported by an endpoint to be added to the Scan API.

A few voted actions will be added to the Daml model and the SV UI to manage Hosted SVs:

- Onboard a new Hosted SV
- Update Hosted SV reward weight
- Offboard a Hosted SV
- Migrate a Hosted SV to a different SV Node

#### Coupon Creation
SV Reward Coupons will continue to be created by each SV Node on behalf of their Hosted SVs.
One `SVRewardCoupon` per round will be created for each beneficiary of each Hosted SV (plus one for the Hosted SV itself if there is leftover weight).

`DsoRules` will be extended with a choice to do this, based on the `HostedSv` contracts.
There will be contracts tracking the reward collection state for the Hosted SVs to ensure
no double dipping happens.

Within a Hosted SV, it will be guaranteed by the Daml model that each beneficiary gets at most one `SVRewardCoupon` per round and with the correct weight.
Making sure that each such coupon actually gets created will _not_ be enforced by the Daml model (it is possible for a malicious SV Node to fail to create coupons).

No UI changes are expected regarding coupon creation.

#### Migration
There will be a choice provided in `DsoRules` to allow an SV Node to migrate from the old model
to the new.

SV Nodes can migrate atomically, and independently of each other.
Both models can coexist, there is no synchronization requirement when it comes to migrating.

No specific UI is expected for migration.
Each SV Node can migrate manually. Using either the Canton Network Console or exercising the choice directly using the Ledger API.

#### Changes to SV Node Onboarding Flow
Since SV Nodes will no longer have any weight associated with them, it is proper that the onboarding flow changes to reflect this.

The existing onboarding flow will be reused as much as possible, but some steps will be changed such that we do not have to specify
weight and related properties when onboarding an SV Node.

The offboarding process is not expected to change.

#### Note
Many or most of these flows require additional changes to the various backend services,
mainly triggers to further the new flows along.


### 3. Architectural Alignment
Our proposal:

- Enhances transparency and verifiability on ledger, reducing trust requirements
- Preserves and reuses as much as possible the existing flows
- Is fully backward compatible
- Has an easy migration path with no synchronization requirements
- Makes it much easier to perform governance operations related to Hosted SVs
- Is more decentralized as the Hosted SVs can now control their own beneficiaries
- Enables further developments such as weight-based voting or automated flows to scale down hosted SV weights (for example in the context of [CIP 105](https://github.com/canton-foundation/cips/blob/main/cip-0105/cip-0105.md#phase-2--on-chain-enforcement))


### 4. Backward Compatibility
All of the changes should be backward compatible.
The system can continue operating at all points in time, even in a partially migrated state.


---

## Milestones and Deliverables
### Milestone 1: CIP and Daml Draft
- **Estimated Delivery:** +10 weeks
- **Focus:** Implement the Daml Draft and the CIP
- **Deliverables / Value Metrics:**
  - Daml PR with a draft implementation
  - CIP submitted
  - CIP approved

### Milestone 2: Main Functionality
- **Estimated Delivery:** +22 weeks
- **Focus:** Main functionality in Devnet
- **Deliverables / Value Metrics:**
  - Merge a series of PRs with the main functionality (everything except the new SV Node Onboarding flow)
  - Deployed to DevNet
  - A majority of SV Nodes migrate to the new model on DevNet
  - Manual testing in DevNet

### Milestone 3: SV Node Onboarding
- **Estimated Delivery:** +31 weeks
- **Focus:** SV Node Onboarding in DevNet
- **Deliverables / Value Metrics:**
  - Merge a series of PRs with the new SV Node Onboarding flow
  - Deploy to DevNet
  - Manual testing in DevNet

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

---

## Funding
**Total Funding Request:** 1,150,000

### Payment Breakdown by Milestone
- Milestone 1 CIP and Daml Draft: 300,000 CC upon committee acceptance
- Milestone 2 Main Functionality: 400,000 CC upon committee acceptance
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
Hosted SV weight being completely off-ledger has at least a few problems:

- Onboarding, offboarding or changing weight for Hosted SVs is a laborious process. It requires voting to change the SV Node's weight and then an off-ledger configuration change on that SV Node.
- Onboarding, offboarding or changing weight for Hosted SVs can only happen sequentially for each SV Node.
We have to wait for the voting to be complete before requesting another SV Node weight change.
- Full trust of SV Nodes is required when it comes to managing their Hosted SVs. Each SV Node can arbitrarily change their reward allocation every round.
- Hosted SVs have to bother their SV Node to have them change their off-ledger configuration when managing their beneficiaries.
- Further developments that rely on Hosted SV weight are currently hard to implement (e.g. weighed voting or automatic weight updates)

This proposal solves all of these issues and provides a strong base for further developments involving SV weight and rewards.

---

## Rationale
This approach is broadly in line with existing conventions, reuses what exists as much as possible and is fully backward compatible with an easy migration path.

The possibility of storing the Hosted SV info in DsoRules itself rather than having separate contracts was considered.
This has the disadvantage of increasing contention for DsoRules, which might become very significant if,
for example, further developments around automated weight updates become a reality.

Having a bulk choice/vote to add/remove/update was also considered but decided against because
it makes votes harder to reason about and is less aligned with the existing conventions in splice.
