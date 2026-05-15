# Proposal: Zusei Physical Oracle (CPO)

## Overview
Zusei is a decentralized Physical Oracle protocol that brings "Ground Truth" location data to the Canton Network via a cryptographic Proof of Presence (PoP) protocol.

## Alignment with Canton Priorities
This project aligns with the **Critical Infrastructure** and **Common Good** priorities of the Canton Foundation. It provides a shared data layer that enhances the utility of:
1. **RWA Protocols:** Verified footfall for real-time asset valuation.
2. **Insurance:** Deterministic data for parametric business-interruption payouts.
3. **AI Agents:** A reliable location layer for autonomous on-chain execution.

## Milestones & Acceptance Criteria

### Milestone 1: Canton-Zusei Adapter Development
* **Funding:** 55,000 CNTN
* **Deliverable:** A functional middleware bridge and Move-based smart contracts.
* **Acceptance Criteria:** Successful end-to-end test of a hardware-generated "Proof of Presence" attestation being signed and stored on the Canton Global Synchronizer.

### Milestone 2: Singapore CBD Reference Implementation
* **Funding:** 65,000 CNTN
* **Deliverable:** Deployment of 20 "Golden Nodes" in the Singapore Central Business District.
* **Acceptance Criteria:** 30 consecutive days of uptime for all 20 nodes with at least 500 verified unique visitor attestations successfully pushed to the Canton Testnet.

### Milestone 3: Verified Visit Derivative (VVD) SDK
* **Funding:** 50,000 CNTN
* **Deliverable:** An open-source SDK for Canton developers.
* **Acceptance Criteria:** Documentation and sample code published on GitHub demonstrating how a third-party Canton app can call the Zusei Oracle to trigger a smart contract event.

## Team
* **Zake (Founder):** Former Growth/Ops Director at CoinW & BingX.
* **Engineering Team:** Experts in high-scale data ledgers.
