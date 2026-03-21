## Development Fund Proposal: Canton Multi-Party Workflow Choreography Reference Implementation

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-21

---

## Abstract

This proposal requests funding for an open-source reference implementation, in Daml and TypeScript, for multi-party workflow choreography across Canton's privacy-partitioned ledger model.

Canton's sub-transaction privacy model means that each participant only sees the contracts they are a stakeholder on. This is Canton's core value proposition for institutional finance. But it creates a coordination problem that has no analog in public-chain development: how do you advance a workflow across parties who cannot see each other's state, without leaking privacy, without requiring a trusted central orchestrator, and without collapsing all parties into a single shared contract that over-discloses?

Every serious Canton application that spans more than two parties hits this problem. Right now, every team solves it independently, inconsistently, and usually incorrectly — by over-disclosing (adding too many stakeholders to a single contract) or by under-specifying (routing coordination signals off-ledger and claiming Canton as settlement-only).

The proposed project, **Canton Multi-Party Workflow Choreography (CMWC)**, will provide:
- a reference Daml choreography contract model with explicit party-set transition primitives
- a TypeScript workflow runner that each participant operates locally against their own ledger projection
- a reference four-party trade settlement scenario demonstrating the full choreography lifecycle
- a choreography design guide documenting when and how to decompose multi-party workflows into Canton-native steps

The goal is not to build a universal workflow engine, not to run a hosted coordination service, and not to replace Canton's native atomic composition when a single transaction can express the full business action. The goal is to give the Canton ecosystem a reusable, open-source reference pattern for **privacy-preserving multi-party workflow choreography on a partitioned ledger**.

---

## Specification

### 1. Objective

The objective is to reduce the design risk and engineering cost of building multi-party workflows on Canton by publishing a concrete reference implementation that other teams can adopt, study, and extend.

Without a shared reference, teams face four recurring problems:

- **Unplanned party-set accumulation.** Workflows start with a small party set and grow it incrementally as more parties are needed, ending with a contract where all parties are stakeholders and the privacy separation the business requires is never achieved.
- **Incorrect handoff implementation.** The atomic archive-and-create-new-contract-with-different-party-set transition is the key primitive of Canton choreography. It is easy to implement incorrectly by accidentally carrying forward parties from the previous step as observers on the new contract.
- **Off-ledger attestation polling.** When a party who is not a stakeholder on the main business contract needs to confirm a local fact (e.g., that funds are available), teams build off-ledger API calls instead of Canton-native attestation contracts, reintroducing off-chain trust assumptions Canton was designed to eliminate.
