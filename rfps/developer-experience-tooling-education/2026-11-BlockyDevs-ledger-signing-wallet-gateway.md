# Ledger Hardware-Wallet Signing for the Canton Wallet Gateway
 
## Development Fund Proposal
 
**Organization:** BlockyDevs  
**Author / Primary Contact:** Piotr Swierzy, CEO, BlockyDevs, piotr.swierzy@blockydevs.com, [@piotrswierzy](https://github.com/piotrswierzy)  
**Status:** Submitted  
**Created:** 2026-11-26  
**Proposal Type:** RFP-aligned proposal  
**RFP / Roadmap Area:** Developer Experience, Tooling & Education: RFP #14, Wallet and dApp Integration tooling. Also addresses RFP #26, Key Management and Signing Controls.  
**Champion:** `Needs Champion`  
**Total Funding Request:** Up to 860,000 CC, plus an optional independent security review as a pass-through (estimated 100,000–150,000 CC)  
**Project Duration:** 18 months. Delivery by month 6, adoption to month 14, maintenance for 12 months after delivery.  
**Label:** wallet-apps  
 
---
 
## Abstract
 
The Wallet Gateway, Canton's standard dApp connector, supports custodial and MPC signing providers but no hardware wallet. Ledger's Canton device app exists and clear-signs everyday transfers, but only Ledger Wallet uses it, and Ledger Wallet accounts are hosted on Ledger's and Kiln's validators, out of reach of Gateway-based dApps. BlockyDevs will build an Apache-2.0 `ledger` signing provider for the Wallet Gateway, on top of a TypeScript Canton signer for Ledger's Device Management Kit (DMK), and maintain both for 12 months. Any Gateway operator can then let users sign dApp transactions on a Ledger device, with the key never leaving the device. This implements the Gateway's open feature request for a hardware signing driver ([canton-network/wallet#2596](https://github.com/canton-network/wallet/issues/2596)).
 
BlockyDevs is a Ledger partner team: it wrote Ledger's Qubic device app and DMK Aleo signer kit, extended the Solana and Hedera device apps, and our team members help support multiple coin integrations in Ledger Live. See [BlockyDevs' Ledger experience](#blockydevs-ledger-experience).
 
## Specification
 
### 1. Objective
 
A Wallet Gateway user approves and signs dApp transactions on a Ledger device, on any validator, with supported transfers clear-signed on the device screen.
 
### 2. Implementation Mechanics
 
The work has three components. The first exists only to serve the other two.
 
**Canton signer for Ledger DMK** (`@blockydevs/device-signer-kit-canton`, TypeScript). DMK is Ledger's current device SDK and has signer kits for other chains but none for Canton. The kit covers every command of Ledger's Canton app ([APDU.md](https://github.com/LedgerHQ/app-canton/blob/main/doc/APDU.md)): public key and party ID with on-device confirmation, prepared-transaction signing, topology-message signing and hash signing. It streams transactions to the device in chunks, maps the device status codes to typed errors and reads the app version. It runs over WebHID in the browser and HID in Node. Ledger's `hw-app-canton` package in ledger-live is the reference for transaction encoding; it expects a JSON transaction, while the Gateway holds the prepared transaction as encoded protobuf, so the kit adds that decoding.
 
**Wallet Gateway Ledger driver** (`core-signing-ledger`). A new `ledger` provider that implements the Gateway's `SigningDriverInterface`, alongside the existing internal, participant, Fireblocks, Blockdaemon, Dfns, Securosys and BitGo providers. On a signing request the driver stores the prepared transaction and its hash and returns `pending`, reusing the Gateway's existing pending flow. Once the device returns a signature, the driver verifies it against the transaction hash and the party's public key with `verifySignedTxHash` from `core-signing-lib`, and rejects a mismatch. Device errors map to CIP-0103 errors: a rejection on the device (`0x6985`) becomes `4001 User Rejected Request`, and "blind signing disabled" (`0x6A80`) returns an instruction the user can act on.
 
**Browser signing step.** The Gateway runs on a server and the Ledger is plugged into the user's computer. The Gateway's approval page therefore connects to the device over WebHID, fetches the pending transaction, streams it to the device and returns the signature to the Gateway through a new user API call. A Node HID mode covers a Gateway running on the same machine as the device. The approval-page hook and the new API are agreed with the Gateway maintainers in Milestone 1, before any Gateway code is written for upstream.
 
**Device signing modes.** Every dApp transaction uses `SIGN_PREPARED_TRANSACTION`: the device receives the full prepared transaction, recomputes the V2 hash itself and shows the decoded action when the transaction is a supported type ([CLEARSIGN.md](https://github.com/LedgerHQ/app-canton/blob/main/doc/CLEARSIGN.md)). Account setup on a validator other than Ledger's or Kiln's uses `SIGN_HASH` over the topology multi-hash, which requires the app's blind-signing setting. The app's clear-signed setup mode refuses validators other than Ledger's and Kiln's, so it is not used.
 
| Action | On the device |
|---|---|
| Send Canton Coin or a supported token (CC, CBTC, USDCx, SBC, CUSD) | Clear-signed: from, amount, to, token, memo |
| Create a transfer pre-approval; accept, reject or withdraw a transfer | Clear-signed |
| Set up an account on a validator other than Ledger's or Kiln's | Blind-signed once; hash shown on the device and on the approval page |
| Other tokens, DvP allocations, other dApp actions | Blind-signed; hash shown |
 
**Account safety.** Keys are Ed25519 under `44'/6767'`, as the device app requires. A party's ID derives from its key, so reusing the key behind a user's Ledger Wallet account could re-host that account away from Ledger and Kiln. The driver uses an account index distinct from Ledger Wallet's, checks before setup whether the party already exists, and refuses to change its hosting. During setup the approval page shows the party ID, the hosting validator and the hash to compare with the device screen.
 
**Testing.** CI runs the kit and the driver against pinned `app-canton` builds in Ledger's Speculos emulator on a local Canton network, for Nano S Plus, Nano X and a touchscreen device. WebHID cannot be driven by a real device in CI, so end-to-end tests run through an emulator-backed transport. Each release is tested manually on DevNet and TestNet with physical devices.
 
### 3. Architectural Alignment
 
The work extends the Gateway through its existing signing-provider interface and CIP-0103 error model, and adds one approval-page step and one user API call agreed with the maintainers. It matches the Foundation's institutional wallet requirements checklist, which marks a Gateway signing driver as required and clear signing as recommended. It serves RFP #14's signing flows and account management, and RFP #26's aim of human-readable verification and less blind signing. Because the device recomputes the transaction hash from the transaction itself, a compromised Gateway or participant cannot get a different transaction signed without the change showing on a clear-signed screen or as a hash mismatch; this complements the hash-recomputation library proposed under RFP #14 ([PR #617](https://github.com/canton-foundation/canton-dev-fund/pull/617)). It also serves the roadmap goal that party key holders control their own keys and choose their hosting validator.
 
### 4. Backward Compatibility
 
No backward compatibility impact. The `ledger` provider is opt-in; existing providers and their configuration are unchanged. Existing Ledger Wallet accounts are not touched: the separate account index and the pre-setup check prevent re-hosting them.
 
## Milestones and Deliverables
 
Deadlines count from grant approval and shift by the committee's review time for the previous milestone.
 
| Milestone | Deadline | Done when |
|---|---|---|
| 1. Proof of concept and signer kit | Month 2 | An outside developer signs a Canton Coin transfer on a Ledger with the published npm package, using only its documentation. The feasibility report answers the four questions below. |
| 2. Gateway driver | Month 4 | An operator other than BlockyDevs enables Ledger signing on its TestNet Gateway from the operator guide, and a dApp transaction is signed on a physical Ledger. The upstream pull request to `canton-network/wallet` is open. |
| 3. Release | Month 6 | The security review, if funded, shows no open high or critical findings; one operator other than BlockyDevs runs Ledger signing on MainNet; Ledger is listed on the docs.canton.network signing-providers page. |
| 4a. Maintenance | 12 months from Milestone 3 | BlockyDevs publishes a compatibility release and a maintenance note each quarter. |
| 4b. Upstream release | Month 14 | The driver ships in an official Wallet Gateway release. |
| 4c. Production operators | Month 14 | Independent operators run Ledger signing in production on MainNet. |
| 4d. Usage | Month 14 | Usage targets below are met. |
 
**Milestone 1** retires the build risk before most of the grant is paid. It delivers a public proof-of-concept repository and demo video, the signer kit with browser and Node transports, Speculos CI and developer documentation, published to npm with provenance, and a feasibility report that answers:
 
1. Can a party be set up with a Ledger key on a validator other than Ledger's or Kiln's, through hash signing?
2. Does a dApp transaction from the Gateway sign end to end through a forked Gateway with a browser signing step?
3. Which account index does Ledger Wallet use for Canton, and which index will the driver use?
4. Have the Gateway maintainers agreed the provider registration, the approval-page hook and the new user API?
If any answer is no, BlockyDevs proposes a re-scope to the committee before Milestone 2 starts, and nothing beyond Milestone 1 is paid until the committee accepts it. BlockyDevs recruits the outside developer through Canton developer channels. A reviewer named by the committee runs any step left unfinished 30 days after submission.
 
**Milestone 2** delivers the driver, browser and Node signing, account setup with a Ledger key, the account-safety checks, end-to-end CI and the operator guide.
 
**Milestone 3** delivers the security-review fixes, the user guide and the MainNet beta. The optional review is set out under Funding; if funded, its scope and vendor are published before it starts, and its report is published after fixes.
 
**Milestone 4c** counts an operator when an organization independent of BlockyDevs confirms on the pull request, or privately to the Foundation, that it runs Ledger signing in production, and gives the update ID of one Ledger-signed MainNet transaction. The Foundation confirms private reports to the committee.
 
**Milestone 4d** is met when at least 3 independent organizations use the packages, at least 5 issues or pull requests come from outside contributors, and operators report at least 500 Ledger-signed MainNet transactions in total.
 
Maintenance covers releases within four weeks of an `app-canton` or Wallet Gateway release that breaks compatibility, security and dependency updates, issue triage and outside contributions. If the driver is merged upstream, BlockyDevs keeps maintaining it there for the maintenance period.
 
## Acceptance Criteria
 
The Tech & Ops Committee accepts each milestone against the completion criteria above. Every engineering milestone is confirmed by someone outside BlockyDevs using the work, not by BlockyDevs' own report.
 
## Funding
 
**Total Funding Request:** Up to 860,000 CC, plus an optional security review as a pass-through.
 
| Milestone | Deadline | CC | Paid upon |
|---|---|---|---|
| 1. Proof of concept and signer kit | Month 2 | 150,000 | Committee acceptance |
| 2. Gateway driver | Month 4 | 170,000 | Committee acceptance |
| 3. Release | Month 6 | 60,000 | Committee acceptance |
| 4a. Maintenance | 12 months from Milestone 3 | 80,000 | 20,000 per quarter |
| 4b. Upstream release | Month 14 | 100,000 | Release including the driver |
| 4c. Production operators | Month 14 | up to 200,000 | 50,000 per independent operator, up to four |
| 4d. Usage | Month 14 | 100,000 | All usage targets met |
| Total |  | up to 860,000 |  |
 
Engineering (Milestones 1–3) is 44% of the request, maintenance 9% and adoption 47%. If the Gateway maintainers decline to merge the driver, BlockyDevs ships it as a standalone package compatible with the driver interface and Milestone 4b is not paid. Unpaid Milestone 4 amounts lapse at month 14; the committee may extend that deadline by up to three months for an operator still onboarding.
 
**Optional security review (pass-through, outside the 860,000 CC).** The committee decides whether to fund it. Estimated at 100,000–150,000 CC, about one auditor-week. Keys never leave the device, so the review skips cryptography and firmware and covers what decides what gets signed: the blind-signed account-setup and hash paths and what the approval page shows for them, authorization on the new Gateway user API, the account-safety checks, transaction decoding in the signer kit, and npm supply-chain controls. BlockyDevs publishes the vendor, scope and quote before the review starts, and the amount is paid on Milestone 3 acceptance against the auditor's invoice. If the committee does not fund it, Milestone 3 instead requires a published threat model and a self-review against it, the signer kit reviewed by Ledger as an upstream pull request to its DMK repository, and the driver reviewed by the Gateway maintainers; the Milestone 3 amount is unchanged.
 
### Volatility Stipulation
 
The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and is re-evaluated at the 6-month mark. BlockyDevs may also request a re-evaluation of the remaining milestones if the CC price moves more than 25 percent from its price at approval.
 
## Co-Marketing
 
At release, BlockyDevs will announce with the Foundation, publish a technical post on hardware signing through the Gateway, and demo it on a Canton developer or Wallet Apps SIG call. The signer kit is offered to Ledger for its DMK repository.
 
## Motivation
 
No hardware wallet can sign for a Gateway-connected dApp today. Users who keep their keys on a Ledger can hold Canton Coin in Ledger Wallet, but cannot use those keys with dApps that connect through the Gateway. Every Gateway operator gains a self-custody option without integrating a device themselves, and every dApp built on the Gateway inherits it with no code change. Institutions that require keys on dedicated hardware, and retail users of retail-facing wallets and dApps, are the primary adopters. BlockyDevs targets the Wallet Apps SIG members and Gateway operators first.
 
## Rationale
 
The Gateway already defines a signing-provider interface; a Ledger provider extends it the same way the custodial and MPC providers did. The browser step is needed because the device is attached to the user's machine, not the Gateway's server. The signer is built as a DMK kit because DMK is Ledger's current SDK and its pattern for chain signers; `hw-app-canton` is reused as the encoding reference rather than duplicated. Ledger Button, Ledger's dApp connector, supports only EVM, Solana and XRP and depends on Ledger's partner key and backend. Trezor does not support Canton and is not accepting new coins. Changes to Ledger's device app are out of scope. Clear-signed account setup on any validator and clear-signed DvP settlement are the natural next steps; because BlockyDevs has shipped device-app code under Ledger's review, it can offer to build them with Ledger's Canton team as a follow-up.
 
## Constraints, Limitations and Out of Scope
 
WebHID runs in Chromium-based desktop browsers only (Chrome, Edge, Opera); Firefox, Safari, mobile browsers and Bluetooth are out of scope. The Nano X app accepts transactions up to 7 KiB, so larger dApp transactions fail on Nano X with a clear error and are documented. Account setup on a validator other than Ledger's or Kiln's is blind-signed once, with an explicit warning and the hash shown on both screens. Out of scope: Ledger Button and Ledger Wallet Provider, changes to Ledger's device app, other hardware wallets, the Gateway's browser-extension version, and Ledger's servers and token list. The driver supports a pinned range of `app-canton` versions and checks the version at connect time; a change to the app's command interface or transaction format outside that range triggers a re-scope with the committee.
 
## BlockyDevs' Ledger experience
 
BlockyDevs is a Ledger partner. Ledger Live's CODEOWNERS lists a `@ledgerhq/ledger-partner-blockydevs` team as co-owner, with Ledger's third-party leads, of the Hedera, Aleo, Algorand, ICON, MultiversX and Casper coin modules and of the `live-signer-aleo` package. The team has shipped every layer this proposal touches, all merged into Ledger's own repositories:
 
| Layer | Work | Where |
|---|---|---|
| Device app, written from scratch | Qubic app for Ledger devices | [LedgerHQ/app-qubic](https://github.com/LedgerHQ/app-qubic) |
| Device app, new features | Solana: ComputeBudget fee display, fuzzing, off-chain message signing, under the Solana Foundation's [Ledger app RFP](https://forum.solana.com/t/the-solana-app-for-ledger-devices/367), reviewed by Solana Labs and Ledger | [LedgerHQ/app-solana](https://github.com/LedgerHQ/app-solana) |
| Device app, maintenance and audit fixes | Hedera: ERC-20 clear signing, swap parsing, audit fixes, memo handling | [LedgerHQ/app-hedera](https://github.com/LedgerHQ/app-hedera) |
| DMK signer kit | Aleo signer kit, the same kind of package this proposal builds for Canton | [device-sdk-ts `signer-aleo`](https://github.com/LedgerHQ/device-sdk-ts/tree/develop/packages/signer/signer-aleo) |
| Host library | Qubic JavaScript library for the Qubic device app | [`@blockydevs/qubic-hw-app`](https://www.npmjs.com/package/@blockydevs/qubic-hw-app) |
| Wallet integration | Ledger Live support for Hedera, Aleo (including staking and swap), XRP and Casper | [LedgerHQ/ledger-live](https://github.com/LedgerHQ/ledger-live) |
 
BlockyDevs engineers have authored over 600 merged commits across these Ledger repositories since 2023. For this grant that means the team already works daily with the APDU protocol, chunked transaction streaming, device status codes, Speculos testing, DMK signer kits and Ledger's code review. The new part is Canton itself, which Milestone 1 covers.
 
