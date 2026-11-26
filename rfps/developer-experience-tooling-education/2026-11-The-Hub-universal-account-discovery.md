# Universal Account Discovery: one key, every wallet

| Field | Value |
|---|---|
| Organization | The Hub (thehubcc.io) |
| Author / Primary contact | Abdulkadir Canpolat, Team Lead, canpolat@thehubcc.io |
| Champion | Needs Champion |
| Proposal type | RFP-aligned proposal |
| RFP / Roadmap area | RFP 14 Wallet and dApp Integration tooling; RFP 10 Federated Canton Name Service |
| Related standards | CIP draft "Universal Canton Accounts" (canton-foundation/cips#303); CIP-0056; CIP-0103; Identity & Metadata SIG credentials proposal (upcoming) |
| Total funding request | 1,200,000 CC |
| Duration | 3 months; milestone based, each milestone is paid on acceptance |

## 1. Objective

Make a Canton account recognisable and usable in any conforming wallet, the way an EVM address works in every EVM wallet. A user who imports a recovery phrase or a key into a second wallet should find the same party, with its hosts and holdings, without help from the wallet that created it.

## 2. Problem

Today a Canton account is tied to the wallet that created it. The same recovery phrase gives a different key, or a different party, in another wallet. Even with the right key, a second wallet has no standard way to find which parties the key controls, where they are hosted, or how to read their holdings. Users are locked in, dApps integrate wallet by wallet, and the multi-wallet integration expected of Featured Apps depends on interoperability that does not exist yet.

## 3. Scope

This proposal funds the account and discovery layer. Moving a party between validators (RFP 1, Party Mobility) and package directories are left to the work already under way in those areas; this project connects to them through stable interfaces.

### WP1 · Standard key derivation (RFP 14)

- BIP-39 and SLIP-0010 ed25519 derivation on `m/44'/6767'/a'/0'/0'` (6767 is the registered SLIP-0044 coin type for Canton Coin), contributed to the reference Wallet SDK (TypeScript) with a Python port.
- The current Wallet SDK derivation kept as a named legacy scheme, plus a small registry of legacy schemes so existing wallets can declare theirs.
- Published test vectors.

### WP2 · Account identifier as a credential (RFP 10)

- A deterministic account identifier derived from the public key, represented as a credential associated with the partyID, following the Identity & Metadata SIG credentials standard. PartyID generation stays unrestricted.
- Reference issuer and verifier libraries (TypeScript, Python).

### WP3 · Party discovery (RFP 10)

- A discovery endpoint that answers "which parties does this key or namespace control, on which hosts, with which permissions and threshold", built from topology state and the WP2 credentials.
- A public open-source service, run by The Hub during the grant, and a contribution proposed to Splice Scan so it can ship in a Splice release.

### WP4 · Wallet integration and conformance (RFP 14)

- Import and export flow in the Wallet SDK using WP1 to WP3, with the read path through the Wallet Gateway where available.
- A public conformance suite for Level 1 (import: same key, same party, discovered hosts) and Level 2 (operate: read holdings and complete a transfer from a second wallet).
- Integration of WP1 to WP3 into three existing Canton wallets, delivered as pull requests written by the team, each reaching Level 2.

## 4. Technical approach

- Derivation and identifiers are pure functions with test vectors; they run in any wallet, browser or server.
- Discovery reads public topology state only; no private data leaves a validator.
- No component holds user keys. Every write is signed by the party's own key.
- All code under Apache 2.0; specifications through the CIP process.

## 5. Architectural alignment

- Builds on the Wallet SDK, the Wallet Gateway and CIP-0103 instead of introducing a parallel stack.
- Follows the Identity & Metadata SIG credentials model for the account identifier.
- Leaves party movement to the Party Mobility work and package distribution to the package directory work, and exposes hooks for both.

## 6. Milestones and deliverables

| Milestone | Deliverables | Funding |
|---|---|---|
| M1 | WP1: derivation with separate namespace and signing branches, TypeScript and Python, test vectors, legacy scheme registry; pull request to the Wallet SDK | 300,000 CC |
| M2 | WP2 and WP3: account credential issuer and verifier (aligned with the SIG standard when published), discovery service live on DevNet and MainNet, Scan contribution opened | 300,000 CC |
| M3 | WP4: import and export flow in the Wallet SDK, public conformance suite for Levels 1 and 2, results for The Hub | 300,000 CC |
| M4 | WP4: integration pull requests in three existing Canton wallets, each passing Level 2 | 300,000 CC |

## 7. Acceptance criteria

- M1: test vectors published and reproduced independently in TypeScript and Python; Wallet SDK pull request open with tests passing.
- M2: a credential issued for a party with a non-deterministic hint verifies without any issuer; discovery returns the correct parties, hosts and threshold for the conformance fixtures on DevNet and MainNet.
- M3: a second wallet imports an account created by another wallet, discovers its party and completes a transfer, on DevNet and MainNet; conformance suite and results public.
- M4: integration pull requests open in three wallet repositories, each passing the Level 2 conformance suite on DevNet and MainNet.

Adoption after the grant (merging of the wallet pull requests, registrations of legacy schemes, the Scan release) is tracked publicly and reported to the Committee; it is not a payment condition, since it depends on other teams' release cycles.

## 8. Budget rationale

The Committee is best placed to judge the value of this work to the network. The amount proposed reflects ecosystem rates for equivalent scope and is at the Committee's discretion. The M1 reference implementation already exists in TypeScript and Python and passes its test vectors, and The Hub runs in production on Canton MainNet with more than 1,300 registered organic accounts.

## 9. Ecosystem value

- Users keep their account when they change wallets.
- dApps integrate once and reach every conforming wallet.
- The multi-wallet requirement for Featured Apps becomes achievable for every app.
- Every component is a public good with no single owner.

## 10. Team

The Hub runs a live consumer application on Canton MainNet with its own validator and more than 1,300 registered organic accounts. Its user accounts already use a deterministic, key-derived party id rule, which this proposal generalises.

- Abdulkadir Canpolat, founder and team lead: product and technical direction, the UCA CIP, coordination with the Identity & Metadata SIG, the Committee and wallet teams, milestone delivery.
- Barış Önal, lead engineer: WP1 to WP4 implementation, discovery service operation, wallet integrations. Software engineer specialising in blockchain technologies and decentralised systems; previously worked on enterprise-scale projects at Turkish Airlines and PwC; focused on resilient web3 architectures, smart contracts and scalable full-stack applications.
