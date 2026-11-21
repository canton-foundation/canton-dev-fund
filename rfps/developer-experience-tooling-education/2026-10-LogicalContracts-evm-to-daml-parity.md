## Development Fund Proposal

**Organization:** Renting Point - Serviços de Informática, Lda. (Logical Contracts), Portugal
**Author / Primary Contact:** Miguel Calejo, mc@logicalcontracts.com, GitHub `mcalejo`
**Status:** Submitted
**Created:** 2026-10-06
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Developer Experience, Tooling & Education: RFP 18, Integration into SDLCs (testing frameworks, CI/CD pipelines); also relevant to RFP 19, DPM components
**Champion:** `Needs Champion`
**Total Funding Request:** 1,300,000 CC
**Project Duration:** 6 months
**Label:** daml-tooling

---

## Abstract

Teams that bring an existing Ethereum application to Canton currently have two options. They can run the Solidity unchanged on the EVM compatibility layer, or they can rewrite it in Daml by hand, and in the second case there is no way to check that the rewrite behaves like the original.

We propose an open-source tool that reads a verified Solidity contract and writes a Daml module for Canton 3.x, along with evidence that the two behave alike. The evidence consists of the contract's own test suite passing on Canton and, for a deployed contract, its recorded mainnet transactions replayed against the generated Daml with state compared after every call. The translation passes through a readable, executable intermediate form (Logical English for LPS, Apache-2.0), which lets a reviewer read what was translated. Any construct the tool cannot translate is listed by name in a ledger instead of being dropped.

Both halves of this path already exist as working, privately developed software that has been checked against solc, an EVM and a Canton sandbox. The grant would fund the parts that do not exist yet. These are a single EVM-to-Daml tool that writes idiomatic Daml (with Canton Network Token Standard interfaces for token families), parity evidence produced on Canton itself, the open-source release with a continuous-integration step, and adoption by independent teams.

---

## Specification

### 1. Objective

We will build one tool, `evm2daml`, which takes a Solidity contract and produces:

1. a Daml module for Canton 3.x that a Canton developer would recognise as Daml, with templates per kind of state, choices per function, parties for addresses, and CIP-0056 interfaces for ERC-20-shaped tokens;
2. the contract's tests as Daml Scripts, run on Canton;
3. for a deployed contract, a **parity report** in which the chain's recorded transactions over a chosen window are replayed on the generated Daml and every state value is compared. The report lists and explains every disagreement, and includes a negative control to show that the comparison discriminates;
4. a line-by-line ledger recording what was translated, what was approximated (and how), and what was refused.

With these outputs, a team porting an EVM application to Canton can give an auditor, counterparty or regulator actual evidence of behavioural parity where today it can only assert it, and can keep that evidence up to date in continuous integration.

To keep the project to a single objective, the following are out of scope: Vyper, proxy patterns beyond binding an implementation to its instance, Daml Finance, a 256-bit integer library for Daml (RFP 16), and translation in the reverse direction.

### 2. Implementation Mechanics

**The pipeline.** `solc` produces the typed abstract syntax tree. A front end then executes each public or external function symbolically, one path at a time, inlining modifiers and internal calls and resolving inheritance. Each path becomes either a transition rule (the storage writes, under the path's conditions) or a refusal rule (a `require`, a `revert`, or checked arithmetic that would panic). Mappings keep Solidity's zero default. External calls, assembly and `delegatecall` are treated as residue, meaning that the source is kept verbatim and listed in the ledger while the other paths of the function are still translated. The output of this stage is a program in Logical English for LPS, an executable controlled-English language whose runtime is open source (github.com/LogicalContractsOrg/lps2). That same program is then written out as Daml.

**The Daml target (new work).** The existing Daml writer is faithful, but its output is not idiomatic because it keeps the whole state in one `State` contract with an operator signatory. In Milestone 1 we replace this with the mapping a Canton developer would write by hand. Each mapping or role becomes a template keyed by its party, each function becomes a choice with the caller as controller, and refusal rules become `ensure` and `assertMsg`. For ERC-20-shaped families (balances, transfers, mint, burn, pause, owner, blocklist) the generated code implements the holding, transfer-instruction and metadata interfaces of the Canton Network Token Standard (CIP-0056). CIP-0056 deliberately has no counterpart for allowances, so these are generated as application-level choices and marked as such in the ledger. Where OpenZeppelin's Daml contracts library (an approved Development Fund project) provides a primitive, the writer will target it and will not generate its own. Until that library is released the writer uses generated primitives, and switching over is a matter of writer configuration.

**Numbers.** Daml has no counterpart to Solidity's `uint256`, and its `Decimal` holds 38 digits. The writer therefore states the bound it assumed in the generated module, and the parity harness checks every replayed value against that bound. If a contract's recorded history exceeds the bound, the report fails and says so. If a U256 library is funded under RFP 16 the writer can target it, but that is not part of this proposal.

**Parity evidence (new work).** At present the replay of mainnet history is checked against the intermediate form, and the generated Daml is checked against the intermediate form on a Canton sandbox. Milestone 2 connects the two ends directly. The recorded transactions of a deployed contract (logs, balances and supply read from a public node) are submitted to the generated Daml on a Canton participant, and after each transaction the state is read back through the Ledger API and compared with the chain's. The report is produced in Markdown and JSON. It includes the readable form of the contract (who may do what, under which conditions, with which effect) so that a reviewer who is not a developer can see what was translated.

**Packaging (new work).** We will ship a command-line tool, a GitHub Action that runs the translation and the parity check as a CI/CD pipeline step and fails the build when a disagreement appears, and a DPM component that follows DPM component conventions. This puts the workflow in the places where Canton developers already work.

**Operational approach.** The code will be under Apache-2.0 from the first public commit, with issues and pull requests handled in the open repository. Each release pins a Canton SDK version and comes with a documented upgrade procedure.

### 3. Architectural Alignment

- The 2026–2028 roadmap names an EVM compatibility layer as one of the ways developers enter Canton. Our tool connects that entry path to native Daml, so a team that runs its contract on Zenith (CIP-0091) today can obtain a native Daml version with evidence that the two behave alike.
- Generated tokens implement CIP-0056 and therefore work with wallets and with the CIP-0086 ERC-20 middleware without adapter code.
- The tool extends existing components. The writer targets OpenZeppelin's Daml library when available, DPM for packaging and the Ledger API for parity reads, and it needs no change to Canton, the Daml compiler or the Daml-LF interpreter.
- On the privacy model, Daml parties and observers are declared from the contract's roles, and the parity harness reads state only as the parties that can see it.

### 4. Backward Compatibility

No backward compatibility impact. The tool is purely additive and does not change Canton, Daml, DPM or any existing package.

---

## Proof of Concept

Both directions already exist, and their results are documented publicly.

- Solidity → Logical English for LPS. This covers OpenZeppelin's ERC-20, Ownable and Pausable, their Contracts Wizard composition, and Circle's FiatToken logic. We replayed 822 USDC mainnet calls (blocks 25968820–25968831, implementation verified on Sourcify), and 849 of 849 compared values agree with the chain, while the negative control agrees on 165 of 215. The twins, ledgers and replay data are at github.com/LogicalContractsOrg/lps2 under `examples/migration/solidity/`, and the guide is at lps2.logicalcontracts.com/docs/user/integrations/solidity.
- Logical English for LPS ↔ Daml. We read in 22 Daml Scripts from the SDK's own templates. Of these, 18 end in exactly Daml's active contracts on a Canton 3.5 sandbox, and the other four are explained (time, text functions, ledger queries). In the other direction, every program the writer accepts ends in the same state as the intermediate form once it has been written as Daml, built with `dpm build` and run on the sandbox. See `examples/migration/daml/` and the guide at lps2.logicalcontracts.com/docs/user/integrations/daml.

The translators that produced these results are proprietary at the moment. They will be released under Apache-2.0 as part of Milestone 3, and no funding is requested for them.

---

## Milestones and Deliverables

### Milestone 1: Idiomatic Daml from EVM token families
- **Estimated Delivery:** end of month 2
- **Focus:** the Daml target described in §2, including the Canton Network Token Standard interfaces
- **Deliverables / Value Metrics:**
  - ERC-20, Ownable, Pausable and their Wizard composition written as Daml for Canton 3.x, each building with `dpm build`
  - the contracts' test suites as Daml Scripts, passing on a Canton sandbox
  - the generated ERC-20 token passes Splice's own token-standard test package (`splice-token-standard-v1-test`), and the test package for the V2 revision of the standard once V2 is ratified (that package is already in Splice)
  - the ledger format, in which every refusal names its source line
  - a public design note on the mapping, reviewed with the Daml Language & Developer Tooling SIG

### Milestone 2: Parity evidence on Canton
- **Estimated Delivery:** end of month 4
- **Focus:** mainnet history replayed against generated Daml on a Canton participant
- **Deliverables / Value Metrics:**
  - the parity harness and report format (Markdown and JSON), with the negative control
  - USDC's FiatToken: at least 800 recorded mainnet calls replayed on the generated Daml on Canton, where every compared value agrees or every disagreement is listed with its cause
  - the readable form of each contract in the report (permissions and effects), checked against the generated Daml's own runs
  - one further deployed contract, chosen with the SIG from an actual porting need of a Canton ecosystem team

### Milestone 3: Open-source release and CI integration
- **Estimated Delivery:** end of month 5
- **Focus:** RFP 18, that is, the tool in a team's existing software development lifecycle
- **Deliverables / Value Metrics:**
  - a public Apache-2.0 repository containing the Solidity reader, the Daml writer and reader, the parity harness, documentation and examples
  - a GitHub Action that runs translation and parity check as a CI/CD pipeline step
  - a DPM component exposing the same workflow, following DPM component conventions
  - a getting-started guide that a new user can follow without our help, and a maintenance plan naming the supported Canton SDK versions

### Milestone 4: Adoption by independent teams
- **Estimated Delivery:** end of month 6
- **Focus:** ecosystem use of what has been delivered
- **Deliverables / Value Metrics:**
  - at least three organisations independent of the applicant run the tool on a contract of their own and give written feedback (public issue, pull request or signed statement)
  - at least one of them keeps the parity check in its CI
  - adoption-blocking defects fixed or documented with a workaround
  - a short public adoption report covering who tried the tool, on which contracts, what failed and what comes next

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone, demonstrated on the current stable Daml SDK and Canton version at the time of delivery
- the parity report for USDC being reproducible by a reviewer from the public repository, with the public node and block window named
- CIP-0056 conformance of generated tokens demonstrated with Splice's token-standard test package instead of our own tests
- all software under Apache-2.0 in a public repository, with documentation
- Milestone 4's adoption evidence coming from organisations that have no commercial relationship with the applicant

---

## Funding

**Total Funding Request:** 1,300,000 CC

### Payment Breakdown by Milestone
- Milestone 1, Idiomatic Daml from EVM token families: 300,000 CC upon committee acceptance
- Milestone 2, Parity evidence on Canton: 300,000 CC upon committee acceptance
- Milestone 3, Open-source release and CI integration: 250,000 CC upon committee acceptance
- Milestone 4, Adoption by independent teams: 350,000 CC upon final release and acceptance

No funding is requested for the existing translators, which are released under Milestone 3 at no charge.

### Volatility Stipulation
The project duration is under 6 months. The grant is denominated in fixed Canton Coin and the applicant carries the price risk. Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for USD/CC price volatility.

---

## Co-Marketing

Upon release, the applicant will collaborate with the Foundation on:

- announcement coordination
- a technical write-up of the USDC parity report and of the CIP-0056 mapping
- a recorded walkthrough, and a session for the Daml Language & Developer Tooling SIG

---

## Motivation

Ethereum has the largest body of deployed smart-contract code, and the roadmap expects part of Canton's growth to come through it. The approved OpenZeppelin proposal describes the gap that these teams face as an architecture "fundamentally different from Solidity/EVM" with no battle-tested library. That library will close the gap for the primitives. The application logic built on top of the primitives still has to be rewritten, though, and at present no one can show that a rewrite behaves like the contract that already holds the assets.

The beneficiaries are the teams that enter Canton with an existing EVM codebase (whether they come through Zenith first or go straight to Daml), their auditors and counterparties, who would receive evidence where they now receive assurances, and the ecosystem as a whole, which gets ports that are correct on first deployment. We expect the first users to be token issuers and DeFi protocols already in contact with the ecosystem, because their contracts are the ones the reference models cover. We have chosen to measure adoption against Milestone 4's criteria and do not estimate it here.

We searched this repository on 6 October 2026 for "solidity", "evm", "transpil" and "migrat" and found no funded or open proposal that translates Solidity into Daml. The closest projects are complementary to ours. Zenith runs EVM code unchanged, OpenZeppelin provides the Daml primitives to rewrite against, CIP-0086 puts an ERC-20 face on CIP-0056 tokens, and the Daml Code Assistant writes new Daml from English.

---

## Rationale

**Why a translator with evidence, and not a rewrite.** Teams rewrite by hand today, which is slow and unverified. A translator on its own would be unverified as well. What we add is the combination of generated Daml with the contract's own tests and its own history as the check, since those tests and that history are the one specification every deployed contract already has.

**Why a readable intermediate.** Translating straight from the AST to Daml would work, but the only way to review the result would be to read both programs. Because the intermediate form is executable English, a reviewer reads one page per contract, refusals refer to source lines, and nothing is dropped silently. The same form also provides the "who may do what" view in the parity report. The language and its runtime are already open source (LPS2 and Logical English 2, both Apache-2.0).

**Why not read bytecode.** Source code carries the names, comments and structure that make the Daml and the report readable, and verified sources exist for the contracts that matter (Sourcify, Etherscan). Unverified bytecode is out of scope.

**Why extend existing components.** The Daml side targets CIP-0056, OpenZeppelin's library once it is released, DPM and the Ledger API. The tool adds a step to a team's pipeline and does not replace anything in it.

**Alternatives considered.** We looked at three. Running EVM code on Zenith indefinitely is complementary to this tool, whose first users may well be Zenith teams that want a native version. Rewriting by hand with the OpenZeppelin library is the baseline that the tool checks against and speeds up. Daml generated by a language model comes with no evidence of parity, although our tool can check such output as well, because the parity harness accepts any Daml module with the expected interface.

---

## Sustainability

Logical Contracts maintains LPS2 and Logical English 2 as open-source projects. We will maintain this tool in the same repositories and on the same release cadence, tracking Canton SDK releases for at least twelve months after the grant at no cost to the Foundation. Our commercial services (porting work for specific teams, and readable views of contracts for compliance reviews) are built on the tool, which gives us a lasting reason to keep it current.

---

## About the Team

Logical Contracts is the trading name of Renting Point - Serviços de Informática, Lda. (Portugal). Miguel Calejo implemented LPS (Logic Production Systems, the language of Robert Kowalski and Fariba Sadri) and leads Logical English 2 and LPS2, both Apache-2.0 on GitHub. Since 2026, translators from fifteen rule and contract languages into Logical English have been built and documented in those repositories, each checked against the source system's own engine. The Solidity and Daml results above come from two of them. The work is carried out by the author and one other engineer.

---

## References

- 2026–2028 Strategic Roadmap, RFP 16, 18 and 19:
  github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md
- CIP-0056 Canton Network Token Standard; CIP-0086 ERC-20 Middleware; CIP-0091 (Zenith); CIP-0100 (this fund)
- OpenZeppelin Canton ecosystem stack (approved):
  proposals/2026-04-OpenZeppelin-canton-ecosystem-stack.md
- Solidity twins, ledgers and replay data:
  github.com/LogicalContractsOrg/lps2/tree/main/examples/migration/solidity
- Daml twins: github.com/LogicalContractsOrg/lps2/tree/main/examples/migration/daml
- Guides: lps2.logicalcontracts.com/docs/user/integrations/solidity and /daml
