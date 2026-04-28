# Development Fund Proposal

## Party Profile Credentials — Reference Implementation

**Author:** Vlad Kokosh ([v.kokosh@pixelplex.io](mailto:v.kokosh@pixelplex.io))  
**Organization:** PixelPlex  
**Website:** <https://ccview.io>  
**CIP Reference:** <https://github.com/canton-foundation/cips/pull/169>  
**Tech & Ops Champion:** _[To be confirmed — required for external submissions]_  
**Status:** Submission Draft  
**Created:** 2026-04-13  
**Label:** wallet-apps

---

## Abstract

This proposal requests funding from the Canton Development Fund to deliver an open-source reference implementation of the Canton Network Party Profile Credentials standard, published under the Apache 2.0 license.

The implementation will provide a reusable library, tests, examples, and documentation that let wallets, explorers, and dApps publish, update, resolve, and render party profile metadata in a consistent way. Any application on Canton may freely integrate the library at no cost.

The result is ecosystem public-good infrastructure: instead of each team reimplementing parsing, validation, normalization, and merge behavior independently, applications can adopt a shared reference package — lowering engineering cost, reducing integration risk, and ensuring consistent behavior across the network.

---

## About the Proposer

PixelPlex is a General Partner of the Canton Foundation and an active contributor to the Canton ecosystem. The team has delivered several production systems that are in daily use across the network:

- **CCView Block Explorer** ([ccview.io](https://ccview.io)) — a Canton Network explorer widely used by the entire ecosystem and the Canton Foundation itself. CCView's API layer serves data to numerous top parties including Canton Foundation, Modulo Finance, CBTC, Circle, and others.
- **Console Wallet** — one of the largest wallet ecosystems on Canton, supporting EVM compatibility, bridges, swaps, and other features across web browser extension and mobile apps.
- **Governance contributions** — PixelPlex co-authored the dApp CIP, authored the Party Profile Credentials CIP ([#169](https://github.com/canton-foundation/cips/pull/169)), and is actively working on additional proposals for network improvements.

---

## Ecosystem Demand

PixelPlex authored the Party Profile Credentials CIP ([#169](https://github.com/canton-foundation/cips/pull/169)), which has been reviewed and endorsed by Simon Meier from Digital Asset, who has been actively collaborating on the standard's design and sees the need for a public reference implementation that any ecosystem participant can use. The CIP is also being aligned with the Canton Party Resolution Protocol ([#171](https://github.com/canton-foundation/cips/pull/171)) to ensure the two standards work together cleanly.

Without a shared implementation, every wallet, explorer, and dApp will need to independently implement profile parsing, validation, and resolution — leading to inconsistent behavior, duplicated effort, and higher integration risk across the ecosystem.

---

## Problem Statement

Party IDs are effective infrastructure identifiers but poor UX primitives for humans. Wallets, explorers, and dApps need a consistent way to present party identity information — display names, avatars, websites, contact links — so that users can recognize and trust the parties they interact with.

Today, this behavior is fragmented and application-specific. Each application that wants to show human-readable party information must:

1. **Implement its own parsing logic** for profile credential claims, with no guarantee of compatibility with other implementations.
2. **Define its own validation rules** for strings, URLs, handles, and optional fields — creating inconsistency across the ecosystem.
3. **Build its own resolution logic** for deriving an effective profile when multiple credential sources exist for the same party.
4. **Maintain these implementations independently**, duplicating engineering effort across teams.

This fragmentation increases phishing risk (inconsistent display of party identity), raises integration costs for new applications, and slows ecosystem adoption of the profile credentials standard.

---

## Objective and Ecosystem Value

### Objective

Deliver a maintained, open-source reference implementation that helps applications parse, validate, construct, and resolve party profile credentials with minimal custom logic.

### Ecosystem Value

- **Reduces duplicated engineering effort** across wallets, explorers, and dApps by providing a shared, tested implementation.
- **Ensures consistent behavior** so users see the same party profile information regardless of which application they use.
- **Lowers adoption cost** for the profile credentials standard — teams integrate a library instead of interpreting a specification from scratch.
- **Reduces phishing risk** by standardizing how party identity metadata is displayed.
- **Creates reusable public-good infrastructure** that benefits every application on the network.

This proposal is aligned with CIP-0082's stated purpose of supporting dev tools, reference implementations, and long-term ecosystem utility.

---

## Scope

### In Scope

- Core profile claim model (parsing, validation, normalization)
- Claim construction helpers for publishing and updating profiles
- Deterministic resolution helper for deriving effective profiles from multiple credential sources
- Test suite and fixtures covering realistic wallet and dApp scenarios
- Example integrations and developer documentation
- Open-source release under Apache 2.0

### Out of Scope

- Changes to Canton protocol, ledger contracts, or Daml
- Credential issuance infrastructure or registry services
- UI components or rendering frameworks
- Hosting or operating a profile resolution service

---

## Technical Approach

### Components

The implementation delivers the following:

1. **Core claim model.** Stable in-memory representation for party profile data. Supports the profile claim keys defined in the published CIP text at time of delivery. Includes validation and normalization rules for strings, URLs, optional handles, and other supported profile fields.

2. **Read-path helpers.** Parsing and validation of profile-related credential claims into the library's internal model. Clear handling of invalid, missing, conflicting, or unsupported values.

3. **Write-path helpers.** Builder utilities to construct valid profile claim payloads from application input. Normalization logic shared with the read path so behavior is consistent across publishing and consuming applications.

4. **Resolution helper.** Deterministic helper for deriving an effective profile for UI consumption from ordered credential sources. Designed to stay aligned with the final CIP text and the Canton Party Resolution Protocol ([#171](https://github.com/canton-foundation/cips/pull/171)).

5. **Testing and fixtures.** Unit tests, round-trip tests, and multi-source fixtures covering realistic wallet and dApp scenarios.

6. **Examples and documentation.** Minimal example integrations demonstrating profile publication and consumption flows. Documentation for supported claims, validation rules, merge behavior, extension points, and integration guidance.

### Architectural Alignment

- Builds on the Canton Network Credentials model and stays at the application/tooling layer.
- Implements the Party Profile Credentials CIP as reusable code rather than introducing protocol changes.
- Improves developer experience for wallets, explorers, and dApps.
- Supports consistent human-readable party representation across the ecosystem.

---

## Milestones

### Milestone 1 — Core Library and Read/Write Helpers

**Funding requested:** 185,000 CC  
**Estimated delivery:** 6 weeks from kickoff

#### Deliverables

- Public repository with Apache 2.0 license and CI pipeline
- Core profile data model with parsing, validation, and normalization for supported claim fields
- Claim-construction helpers for issuing and updating profile claims
- Test suite and fixtures covering valid and invalid inputs
- Initial developer documentation covering data model, API surface, and usage

#### Acceptance Criteria

- Library can parse profile claims and construct valid claim payloads
- Validation behavior is deterministic and documented
- CI passes with tests covering core flows
- Repository is publicly accessible under Apache 2.0

---

### Milestone 2 — Resolution, Examples, and Release

**Funding requested:** 175,000 CC  
**Estimated delivery:** 3 months from kickoff

#### Deliverables

- Deterministic effective-profile resolution helper for multiple credential sources
- Merge behavior for overlapping fields, with extension points for host apps
- Example integration demonstrating publish → consume → render flow
- Input hardening for malformed or oversized values
- Final documentation, release notes, and tagged production-ready release

#### Acceptance Criteria

- Same ordered input produces the same effective profile output
- A committee member or delegate can run the example integration and observe the end-to-end flow
- Tagged release is publicly available and installable
- Documentation covers claims, validation, merge behavior, examples, and known boundaries

---

## Funding Summary

| Milestone | Description | Funding (CC) |
|-----------|-------------|-------------|
| 1 | Core Library and Read/Write Helpers | 185,000 |
| 2 | Resolution, Examples, and Release | 175,000 |
| **Total** | | **360,000** |

---

## Volatility Stipulation

This proposal is expected to complete within 3 months. Milestone funding is denominated in fixed Canton Coin, and the recipient carries upside and volatility risk.

If delivery extends beyond 3 months due to committee-requested scope changes or material dependencies outside the proposer's control, remaining milestones should be reviewed with the Tech & Ops Committee to account for significant CC/USD volatility.

---

## Delivery Timeline

| Phase | Estimated Timing |
|-------|-----------------|
| Milestone 1 — Core Library | ~6 weeks from kickoff |
| Milestone 2 — Resolution, Examples, and Release | ~3 months from kickoff |

---

## Open Source and Public Good

The entire implementation — library, tests, examples, and documentation — will be published under the **Apache 2.0 license**. Any explorer, wallet, analytics app, or dApp on Canton may freely use, integrate, fork, or build on the library at no cost.

This is a public-good infrastructure project. The output is designed to be adopted and maintained by the broader ecosystem, not locked to a single application or vendor.

---

## Dependencies and Assumptions

This proposal assumes:

- The Party Profile Credentials CIP ([#169](https://github.com/canton-foundation/cips/pull/169)) continues progressing toward acceptance. The implementation will follow the CIP text in force at time of each milestone delivery.
- Alignment with the Canton Party Resolution Protocol ([#171](https://github.com/canton-foundation/cips/pull/171)) continues as agreed between the CIP authors.
- No mandatory core protocol changes are required for the implementation.

If CIP claim keys or naming conventions change before finalization, the implementation will follow the final merged CIP text. Minor alignment changes are considered part of this grant. Material scope expansion beyond the current profile-credential scope would require re-evaluation with the Tech & Ops Committee.

---

## Backward Compatibility

This proposal is entirely additive. Applications that do not adopt the library can continue operating as they do today. The library introduces no protocol changes, no new ledger contracts, and no breaking changes to any existing component.

---

## Security Considerations

The library is a client-side tooling package. It does not:

- custody user funds or keys,
- initiate transactions,
- operate as a service or daemon,
- require privileged access to any ledger or network component.

Input validation and hardening for malformed or oversized values are addressed in Milestone 3.

---

## Co-Marketing and Ecosystem Contribution

Upon release, PixelPlex will collaborate with the Canton Foundation on:

- Coordinated announcement of the reference implementation
- A technical write-up or case study explaining the standard and how to adopt it
- Developer-facing promotion through ecosystem channels

---

## Rationale

**Why a reference implementation?**
Standards move faster when developers can adopt code instead of only reading specifications. A reference implementation helps the ecosystem converge on one consistent behavior for profile credential handling.

**Why fund this through the Development Fund?**
The output is open, reusable, and beneficial to multiple teams — not just one application. It improves developer experience and end-user UX across the network. CIP-0082 explicitly names dev tools, reference implementations, and public-good infrastructure as fund targets.

**Why not let each team implement independently?**
Independent implementations create inconsistent behavior, higher integration costs, and more room for errors. A shared reference library under a permissive license is the most scalable path to ecosystem-wide adoption.

**Why PixelPlex?**
PixelPlex authored the Party Profile Credentials CIP, operates both CCView and Console Wallet (the two primary consumers of this standard), and has a track record of delivering production Canton infrastructure. The team is already deeply familiar with the credential model and has been collaborating with Digital Asset on the standard's design.
