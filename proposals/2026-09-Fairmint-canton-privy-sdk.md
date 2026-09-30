## Development Fund Proposal

**Organization:** Fairmint, Inc.  
**Author / Primary Contact:** Fairmint  
**Status:** Submitted  
**Created:** 2026-09-18  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP-14 Wallet and dApp Integration tooling (Developer Experience, Tooling and Education); also serves RFP-26 Key Management and Signing Controls  
**Champion:** IntellectEU  
**Total Funding Request:** 3,500,000 CC  
**Project Duration:** 12 months (build 4 months; adoption claim window to month 12)  
**Label:** wallet-apps

---

## Abstract

This proposal funds a public TypeScript SDK that lets a Canton application bind
a Privy-held Ed25519 key to an externally hosted Canton party and submit
user-approved (or policy-approved) interactive transactions, without the
application ever handling a private key.

CIP-0103 and `@canton-network/dapp-sdk` standardize how a dApp talks to a
Canton wallet. They do not cover the other common path: the application
already uses Privy for login and embedded wallets, and needs that same key to
act as a Canton external party. Teams on that path today copy key-format
conversion, fingerprint checks, and prepare/sign/execute binding by hand, or
they skip the binding and let a backend sign.

Early Fairmint experimentation confirmed that a Privy-held Ed25519 key can bind
to a Canton external party and sign one prepared interactive submission. This grant
funds the public SDK and its 1.0 freeze, a DevNet reference flow an outside
reviewer can check on-chain, integration documentation, a Wallet Gateway
signing driver, and independently verified MainNet adoption. Trading, NFT issuance, and a second
wallet protocol are out of scope.

---

## Specification

### 1. Objective

**Problem:** Canton applications that already authenticate with Privy have no
shared, reviewed library for external-party signing.

**Outcome:** A public 1.0 SDK, a DevNet reference flow a second reviewer can
check from published transaction references, docs written against that flow,
and at least two applications outside Fairmint using it on MainNet.

The work does not define a new CIP, a wallet, a custody product, or a
trading venue.

### 2. Implementation Mechanics

The SDK sits on Canton's existing interactive-submission split: the participant
prepares a transaction, a key the user controls signs the exact prepared hash,
the participant executes those same bytes.

Two custody modes share that split:

| Mode | Who approves | Where the key lives | SDK entrypoint |
| ---- | ------------ | ------------------- | -------------- |
| Browser-approved | The user, in the browser, for that payload | Privy embedded / linked wallet (Solana Ed25519 in v1) | `/browser` |
| Policy-managed | An application policy and a server-held authorization key | Privy managed signer (Solana or Stellar Ed25519) | `/server` |

Neither mode is a login replacement. A valid signature authorizes one prepared
operation (a versioned envelope carrying audience, request id, party, signing
key, payload, expiry, and a binding token), not arbitrary later commands.

#### What the SDK does

1. Derives the Canton Ed25519 public-key fingerprint from a Privy wallet key.
   No Canton node call.
2. Confirms a submitted public key is linked to a verified Privy identity
   before the backend uses it.
3. Rejects a party id whose fingerprint does not match that key.
4. Binds the signature to one prepared operation. Payload encodings that do
   not match are rejected. Execute must use the bytes that were signed.
5. Browser path: user-approved Privy `signMessage` with an operation-specific
   prompt. The browser sends public keys and signatures only; a small fetch
   transport posts those to the application backend.
6. Server path: policy-managed signing for unattended flows. The policy
   decision happens before any raw-sign call, and the signature is verified
   before it is returned.

The signing package depends only on a hashing library and a schema validator.
It does not ship a Canton client and does not depend on one. It translates a
Privy key into a Canton external-party signer; the application chooses how it
reaches Canton. Two paths are supported and both are demonstrated:

| Path | Who talks to Canton | Who signs | Shown with |
| ---- | ------------------- | --------- | ---------- |
| Application backend | The app's own Ledger API client | This SDK, in the browser or under server policy | `@fairmint/canton-node-sdk` and `@canton-network/wallet-sdk` (Node.js) (Milestone 1) |
| Wallet Gateway | A CIP-0103 Wallet Gateway the dApp reaches through `@canton-network/dapp-sdk` | The Gateway, through this SDK's Privy signing driver | `@canton-network/dapp-sdk` against a Gateway running the driver (Milestone 2) |

Ledger, validator, and scan calls never enter this package, so either SDK can
be swapped for another Ledger API client.

**What a hostile browser can and cannot do.** A browser holding a valid Privy
session can request preparation and submit signatures for its own linked key.
It cannot:

- sign for a party whose fingerprint does not match that key
- reuse a signature on a different payload, party, or request id
- extend an expired prepared operation
- set `actAs`, `readAs`, or disclosed contracts (the backend owns those)
- reach the policy-managed path without the server-held authorization key

The reference backend recomputes the prepared-transaction hash from the
prepared transaction rather than trusting the hash the participant returned.
It uses the hashing that `@canton-network/wallet-sdk` already ships and will
adopt the consolidated hashing package proposed in canton-dev-fund PR #617 if
it lands.

**Reference flow (Milestone 1, DevNet):** connect with Privy, create or select
the external party, receive Canton Coin from a documented funding source,
prepare, approve, and execute a CC transfer. Signing is the same on MainNet;
only the participant, synchronizer, and funding source change. Milestone 1
does not require MainNet transactions.

### 3. Architectural Alignment

**RFP alignment.** RFP-14 asks for wallet integration tooling, reusable
signing flows, account and party management, and application-to-wallet
interaction. This proposal is signing-flow and party-management tooling for
applications whose signer is Privy. RFP-26 asks for signing policies,
human-readable approval, and key custody boundaries; the policy-managed mode,
the operation-specific approval prompts, and the signing-boundary document
answer that.

**CIP-0103 (dApp Standard) and `@canton-network/dapp-sdk`.** CIP-0103 is the
wallet-connectivity standard. A CIP-0103 wallet remains the right choice when
the user brings Nightly, Send, Walley, Askardex, or another compliant wallet.
This SDK is not a CIP-0103 wallet and adds no discovery protocol. The
integration guide will say when to use which: CIP-0103 when the dApp must
speak to arbitrary wallets; this SDK when the signer is already a Privy key.

**Wallet Gateway signing drivers.** `canton-network/wallet` exposes a
`SigningDriverInterface` with drivers for internal Ed25519, participant,
Fireblocks, Blockdaemon, Dfns, BitGo, and Securosys keys. Under CIP-0103 the
Gateway, not the dApp, signs `prepareExecute`, so a Privy key only reaches that path
through a driver. Milestone 2 contributes a Privy signing driver upstream and
shows `@canton-network/dapp-sdk` running against a Gateway that uses it. The
application-side SDK and the driver share one signer type, so a team can start
app-side and move to the Gateway without re-keying.

**Canton interactive submission.** The SDK uses the published prepare /
execute path for externally hosted parties. It does not introduce a new ledger
API.

**CIP-0104.** Direct traffic from user-signed submissions is attributable the
same way as other application traffic. This grant does not change reward
mechanics.

#### Non-duplication

- **Digital Asset dApp SDK (PR #69, approved).** Funds CIP-0103 connectivity,
  discovery, and WalletConnect, a layer this proposal does not touch.
- **PartyLayer (PR #9, approved).** Application UX above
  `@canton-network/dapp-sdk`; it never holds keys or signs. Complementary if a
  Privy-backed app later also talks to CIP-0103 wallets.
- **Keyvoy (PR #96, open since March 2026).** A self-hosted embedded-wallet
  stack meant to replace Privy. This grant does not provision wallets; it
  serves applications that keep Privy.
- **Digital Asset Reference Wallet (PR #90, approved) and Wallet Gateway
  Reference Implementation (PR #109, approved).** External-party flows inside
  a CIP-0103 wallet and the gateway behind it. This SDK is the
  application-side bind when the signer is Privy, not a Canton wallet. The
  Milestone 2 signing driver is a contribution to that gateway.
- **Splice Wallet Kernel maintenance (Digital Asset, approved).** Funds the
  maintainers of `canton-network/wallet`, the repository the Milestone 2
  driver targets.
- **Blockdaemon Institutional Vault signing driver (PR #409, open).** An MPC
  and HSM signing driver for institutional custody behind
  `SigningDriverInterface`. This proposal contributes a Privy driver behind
  the same interface.
- **Supa SDK (`@supanovaapp/sdk`, MIT).** A React kit for the supanova app
  that logs in with Privy and registers a Canton party from a Privy Stellar
  key, bound to Supa's hosted backend and node. This SDK is backend-agnostic:
  a published wire spec, bring-your-own participant, and a server policy mode.
- **`@canton-network/wallet-sdk`.** Canton's Ledger API client for parties
  with external keys. This proposal uses it as one of the two Milestone 1
  wirings; it does not replace it.
- Adjacent, not overlapping: ClearSign (PR #82), Unified Canton Connect
  (PR #4), MetaMask Snap (PR #135), Agentic Wallet Infrastructure (PR #92),
  Canton Mobile SDK (PR #574), and the Loop wallet discovery adapter for the
  dApp SDK (`@canton-network/sdk-support-provider-adapter-loop`). None binds
  an existing Privy session to a Canton external party.

This proposal supplies only a Privy-specific signing adapter and a Wallet
Gateway driver.

### 4. Backward Compatibility

*Fully backwards compatible.* The SDK is a new library. It does not modify
Splice, CIP-0103, Token Standard packages, or deployed assets. Applications
that already use CIP-0103 wallets are unchanged. The Wallet Gateway driver is
additive behind the existing `SigningDriverInterface`.

---

## Milestones and Deliverables

Build work (M1 and M2) can overlap. Milestone 3 is claim-based and pays only
on independent MainNet adoption.

### Milestone 1: Public 1.0, DevNet reference, DevNet docs

- **Estimated Delivery:** 2 months after approval
- **Focus:** Publish the library, prove the signing boundary on DevNet, and
  document that flow. MainNet uses the same signing steps and is not in this
  milestone.
- **Deliverables / Value Metrics:**
  - Public repository (MIT) for `@fairmint/canton-privy-sdk` with a 1.0 API
    freeze for `/`, `/browser`, and `/server`.
  - Installable public npm package at `1.0.0` (or the first stable `1.x` after
    freeze).
  - **DevNet end-to-end flow, on-chain:** connect with Privy, then three
    ledger transactions: external-party allocation, CC receive, CC send. Fairmint
    publishes the three transaction references so an external reviewer can
    confirm each on DevNet without Fairmint-internal access.
  - Runnable reference backend in the public repo, aimed at DevNet, wired two
    ways behind the same prepare / execute routes: `@fairmint/canton-node-sdk`
    (public on npm, MIT) and `@canton-network/wallet-sdk` (Node.js).
  - **Prepared-operation wire spec:** the versioned JSON exchanged between
    browser and backend (prepared operation, receipt, error codes) published
    as a standalone document with test vectors, plus the operational rules an
    implementer needs: idempotency keys, replay rejection, retry and timeout
    behavior, clock-skew tolerance, expiry aligned with the 24-hour
    submission window CIP-0107 gives end-user CC transactions, and the
    supported Canton, Splice, and Privy version ranges. A Python, Java, Go,
    or Rust backend can implement the server side from this document alone.
  - **Privy setup guide:** the Privy dashboard settings the flow needs,
    Solana embedded wallets, server-side policies for the managed path, the
    P-256 authorization key, with what each setting is for and what breaks
    when it is missing.
  - **DevNet documentation:** integration guide (browser-approved flow,
    policy-managed flow, prepare/execute with the application backend);
    signing-boundary document (what the browser may hold, what the backend
    must verify, what a signature does and does not authorize); prompt-copy
    notes for party creation, transfer acceptance, and CC send.
  - **One non-CC example:** a user-approved interactive submission that
    exercises an ordinary application Daml choice, so teams shipping their
    own contracts have a worked path.
  - Negative tests in the public repo: wrong linked key rejected; party
    fingerprint mismatch rejected; prepared-payload substitution rejected;
    policy-managed path rejected without the authorization key.

*Acceptance for M1: public repo and npm `1.x`; DevNet transaction references
for the three CC submissions and the non-CC example; the reference backend
runnable against DevNet on both wirings; wire spec, Privy setup guide, and
DevNet docs published in the repo.*

### Milestone 2: Wallet Gateway path, CIP-0103 composition, docs trial

- **Estimated Delivery:** 2 months after Milestone 1 (may start in parallel)
- **Focus:** Put Privy-managed keys behind the official Wallet Gateway
  interface, show the CIP-0103 dApp path end to end, tell teams when to use
  which path, and prove an outsider can adopt from the Milestone 1 docs.
- **Deliverables / Value Metrics:**
  - **Wallet Gateway signing driver:** an upstream pull request to
    `canton-network/wallet` adding a Privy driver behind
    `SigningDriverInterface`, with tests and a README in the repository's
    driver format. Acceptance is the PR opened and passing that repository's
    CI; merge timing belongs to its maintainers and is not a payment gate.
  - **Gateway-path sample:** a browser dApp using `@canton-network/dapp-sdk`
    (CIP-0103) against a Wallet Gateway that runs the Privy driver, completing
    the same DevNet party-create and CC-send flow as Milestone 1, with
    published transaction references.
  - CIP-0103 composition page: when to use this SDK app-side, when to go
    through a Gateway with `@canton-network/dapp-sdk`, and how an app that has
    both should not mix signing surfaces on one action.
  - MainNet checklist: same Milestone 1 steps; the settings that change
    (participant, synchronizer, funding source; do not reuse DevNet keys),
    and what the hosting participant must have in place: traffic purchase
    for external-party submissions, validator fees, who hosts the party and
    what that costs. No separate MainNet signing document.
  - **Docs usability check:** an external developer, to be named, who is not
    a Fairmint employee completes a working DevNet integration from the
    published docs alone, and provides a written attestation plus a DevNet
    transaction reference or public repository link.

*Acceptance for M2: driver PR open and green upstream; Gateway-path sample
runnable against DevNet with transaction references; CIP-0103 page and MainNet
checklist published; attestation plus artifact from the external developer.*

### Milestone 3: Independent MainNet adoption (claim-based)

- **Estimated Delivery:** claim window from Milestone 2 acceptance to month 12
- **Focus:** Prove the library is used outside Fairmint, on MainNet.
- **Deliverables / Value Metrics:**
  - **Independent integrators on MainNet.** Each claim requires a written
    confirmation from a non-Fairmint party (dApp, wallet, or issuer) plus
    MainNet transaction evidence or a public repository the committee's
    reviewer can inspect. Up to three claims; acceptance of the milestone
    requires at least two.
  - **Fairmint MainNet consumer (unfunded commitment).** Fairmint will run the
    published 1.0 in a production path on MainNet and publish transaction
    evidence.
  - **Adoption note and maintenance start:** who integrated, what broke, what
    changed in 1.x, the 12-month maintenance contact, and the opening of the
    maintenance window.

*Acceptance for M3: at least two independent MainNet integrator claims
verified as above, plus the adoption note.*

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Working function shown by on-chain transaction references a second reviewer
  can verify without Fairmint-internal context (M1 DevNet, M3 MainNet).
- An external developer can integrate from published docs alone, with an
  artifact (M2).
- Each milestone has a yes/no check from published evidence (repository
  state, npm version, upstream PR state, attestations, transaction
  references).
- Value metrics: M3 is paid per verified independent MainNet integrator.

Project-specific conditions:

- **Independent verification.** For M1 and M3, Fairmint will provide demo
  access and on-chain references sufficient for a reviewer designated by the
  committee. Where an integrator's MainNet evidence is privacy-scoped,
  Fairmint will arrange reviewer access with that integrator.
- **No CIP gate.** This proposal does not pay on CIP acceptance.
- **No merge gate.** The Milestone 2 driver is paid on an open, passing
  upstream PR, not on merge.

---

## Sustainability

Fairmint runs a Canton validator and Featured App infrastructure today, and
will run the 1.0 package in its own MainNet path, so maintenance is tied to
Fairmint operations:

- Maintain the public package, the Wallet Gateway driver, tests, and docs for
  12 months after Milestone 3 acceptance (security fixes, Canton and Splice
  compatibility, Privy API changes, integrator questions). This window is
  funded inside Milestone 3.
- Breaking Privy signing changes are handled in a minor or patch on the 1.x
  line, or documented as a 2.0 with a migration note, not as a silent break.
- Non-Ed25519 Privy wallets, CIP-0103 transport, account recovery and key
  rotation products, and trading flows are out of this grant and would be
  separate proposals if needed. Adopters must supply their own participant,
  traffic, and recovery policy; the MainNet checklist states this.

---

## Funding

**Total Funding Request:** **3,500,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 *(Public 1.0, DevNet reference, DevNet docs)*: **900,000 CC**
  upon committee acceptance
- Milestone 2 *(Wallet Gateway path, CIP-0103 composition, docs trial)*:
  **600,000 CC** upon committee acceptance
- Milestone 3 *(Independent MainNet adoption)*: up to **2,000,000 CC**,
  claim-based: **600,000 CC per verified independent MainNet integrator**
  (maximum three, 1,800,000 CC), plus **200,000 CC** on the adoption note and
  maintenance start. Claims unpaid at the end of the window expire; Fairmint
  carries that risk.

Adoption-based share: **2,000,000 of 3,500,000 CC (57%)** is gated on
independent MainNet integrators, above the fund's 50% adoption-based
requirement. M1 and M2 are priced at engineering cost. M3 carries integrator
support, the funded 12-month maintenance window, and the adoption-risk margin.

### Cost Basis

CC amounts use the 30-day average CC/USD price on the submission date
(CoinGecko, $0.108 on 2026-09-18).

- **M1 (900,000 CC):** about three senior engineer-months to
  publish the repository and freeze 1.0, build the DevNet reference backend
  on both wirings, run the funded DevNet CC flow and publish references, and
  write the wire spec, Privy setup guide, non-CC example, and DevNet
  documentation.
- **M2 (600,000 CC):** about two senior engineer-months for the
  Wallet Gateway driver and its upstream review cycle, the Gateway-path sample
  (including a DevNet Gateway deployment), the CIP-0103 page, the MainNet
  checklist, and the external docs trial including the tester's time.
- **M3 (up to 2,000,000 CC):** about one engineer-month of
  integration support per integrator, the 12-month maintenance window, and the
  margin for the risk that fewer than three integrators claim.

### Volatility Stipulation

The build phase is under 6 months. The grant is denominated in fixed Canton
Coin; if the build phase extends beyond 6 months at committee request,
remaining milestone payments will be revalued for USD/CC price volatility per
Development Fund policy. Milestone 3 claims are fixed CC for the whole window
and are not revalued. Scope stays as written.

---

## Demand Evidence

Fairmint will run the published 1.0 in a production path on MainNet (see
Milestone 3, unfunded).

Fairmint is in discussion with application teams that already use Privy and
want a Canton party for those users. Specific teams are omitted from this
public proposal until written confirmations are in place. Names and letters will be added to
this section as they are confirmed.

---

## Co-Marketing

Upon release, Fairmint will collaborate with the Foundation on:

- Announcement of the public 1.0 and the DevNet reference flow.
- A short technical note: Privy key to Canton external party to
  prepare/execute, and how that sits next to CIP-0103 and the Wallet Gateway.
- A Wallet Apps SIG walkthrough for application teams that already use Privy.

---

## Motivation

Applications that already use Privy for login should not have to choose
between standing up a CIP-0103 wallet they do not need or putting keys on
their backend. The beneficiaries are those teams and their users.

---

## Rationale

**CIP-0103 is not the right place for this.** Privy is the signer and
session, not a wallet gateway. Forcing it through CIP-0103 would add a
wallet-provider stack those applications do not run. Section 3 states when
each applies.

**No Canton client ships in the package.** The package solves one problem,
turning a Privy key into a Canton external-party signer. Node access, secrets,
and participant choice differ per app. Depending on any one client would pin
every adopter to it, so the package depends on none; Section 2 shows both
wirings.

**Two custody modes, one set of checks.** User-approved covers party
creation, receive, and send; policy-managed covers unattended flows. Both run
the same prepared-operation checks and differ only in who approves. Omitting
either would force a second library.

**A Canton signature is not a login.** Login is Privy's job. The Canton
signature is bound to one prepared hash. Reusing it as a session token would
break that binding.

---

## Appendix A: What signs what

| Action | What is signed | Backend check |
| ------ | -------------- | ------------- |
| Create external party | Topology hash | Linked key and fingerprint |
| Accept a transfer offer | Prepared acceptance hash | Same, then execute those bytes |
| Send Canton Coin | Prepared CC-transfer hash | Same, then execute those bytes |
| Application choice (non-CC example) | Prepared interactive-submission hash | Same, then execute those bytes |
| Read balances / parties | Nothing | Privy session and linked-key check only |
| Policy-managed party create | Topology hash | Policy and authorization key, no browser prompt |
