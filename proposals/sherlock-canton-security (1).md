## Abstract

Sherlock will run an audit contest on Canton's core infrastructure, covering Daml models, Splice/Global Synchronizer, and the Scala automation layer. The contest puts Canton's codebase in front of 300 to 800 security researchers for 14 to 28 days, led by a Lead Senior Watson selected from Sherlock's top-ranked auditors based on functional programming and systems security expertise. The output is a public findings report and the first Daml security patterns guide. Funding is 75,000 to 295,000 USD equivalent in $CC, finalized after scoping.

## Specification

### 1. Objective

Quantstamp (CIP-0057) checks whether Canton Coin's Daml models match the whitepaper, which is spec verification on one component. The rest of the stack hasn't had an open review: Splice, the sync protocol, the Scala/Daml boundary, cross-domain settlement, Ledger API, and the cryptographic layer. This contest covers those components, grows the pool of researchers who can work on Daml, and publishes everything as a public good for the ecosystem.

### 2. Implementation Mechanics

Sherlock consistently attracts the highest concentration of top security talent to its contests because researchers earn more and build their reputation through Sherlock's ranked leaderboard system. The Ethereum Foundation chose Sherlock for Fusaka's final pre-mainnet stress test ($2M, 28 days, 510+ researchers, 4 high-severity issues caught before launch). Aave, MakerDAO/Sky, and Morpho run their security through Sherlock. Across all engagements, Sherlock secures protocols holding over $250B in TVL. The quality of the field is what makes the model work, and for Canton the relevant expertise runs deep.

- **Functional programming and Daml.** The Lead Senior Watson will be selected from Sherlock's top-ranked auditors based on relevant expertise for Canton's stack. The leading candidate is Gabriel, who has 10 years of production Haskell experience. Since Daml is a Haskell fork with the same type system, functional composition, and monadic patterns for authorization, he doesn't need to learn a new language, he's reading a dialect he's already fluent in. He knows specifically where functional authorization models break: signatory bypass, improper choice authorization, observer escalation, and contract key manipulation. Beyond Haskell, he's found critical logic bugs across Solidity, Rust, and Go codebases on Sherlock's platform. Other candidates in the pool include Kuprum and Vinica, who bring Haskell familiarity alongside deep smart contract auditing experience across multiple languages.
- **Cryptography and privacy systems.** Sherlock contest regular participants like Sammy and Defsec have audited Aleo's zkVM, Brevis ZK CoProcessor, Pico ZKVM, MegaETH's zkVM, and Axal's trusted execution environment. Canton's encryption between participant nodes, sub-transaction privacy guarantees, and cryptographic commitment schemes are the same class of problems they work on regularly: weak randomness, bad key derivation, signature edge cases, nonce reuse, and timing side channels.
- **L1 infrastructure and consensus.** Sherlock's researcher community includes people who've audited full blockchain networks like Aleo and MegaETH, covering consensus mechanisms, validator operations, P2P networking, and API authentication. That maps directly to Canton's sync domains, validator topology, Ledger API, and Scan API. The Interchain Labs CosmWasm engagement covered cross-chain interoperability including message passing, state verification, and trust assumptions across boundaries, which is directly relevant to Canton's cross-domain settlement.
- **The open field.** Beyond the named researchers, contests draw 300 to 800 participants with backgrounds in formal verification, academic Haskell/OCaml, distributed systems, and financial protocol security. The contest's educational materials and prize incentives give researchers with existing functional programming or cryptography experience a concrete reason to engage with Daml, and everyone who participates becomes someone the Canton ecosystem can tap for security work going forward.

**How the contest runs:**

Sherlock scopes the engagement with the Tech & Ops Committee to lock exact repos, commits, and boundaries, and prepares Daml/Canton primers so researchers from EVM, Rust, and Move backgrounds can work effectively on a Haskell-derived codebase. The contest runs for a certain number of days on Sherlock's platform, depending on the scope. The Lead Senior Watson does a full independent review of the entire scope while hundreds researchers work the same codebase in parallel, competing for the prize pool based on severity and uniqueness of findings. Canton's engineering team answers questions throughout. After the contest closes, Sherlock's judging pipeline deduplicates and severity-classifies everything into a clean report, Canton's team fixes the issues, the Lead Senior Watson reviews every patch, and the final report along with a Daml security patterns guide goes public.

**On Daml tooling:** The Lead Senior Watson candidates read Daml natively through their Haskell backgrounds, and the Scala/Daml boundary, where we expect integration-level issues to surface, doesn't need language-specific tooling so much as it needs people who understand both sides and can reason about what happens when they interact incorrectly.

**Scope**

The final scope gets locked during the scoping phase with the Tech & Ops Committee.

### 3. Architectural Alignment

The scope maps to Canton's three-layer architecture and specifically targets cross-layer interactions: how Scala exercises Daml choices, how the sync protocol maintains consistency across domains, and how the API layer exposes or protects internal state. It complements CIP-0057 (spec verification vs vulnerability discovery), covers components introduced by recent upgrades (CIP-0062 Canton 3.3, CIP-0089 Canton 3.4), and is structured per CIP-0082/CIP-0100 requirements.

### 4. Backward Compatibility

No impact. This is a security review that doesn't modify any Canton components. Vulnerabilities found go to Canton's engineering team for remediation through their standard processes.

## Milestones and Deliverables

### Milestone 1: Scoping & Preparation

- **Estimated Delivery:** 2 days from approval
- **Focus:** Lock scope, select Lead Senior Watson, prepare researcher materials, launch the contest
- **Deliverables:** Finalized scope document (repos, commits, threat model), Lead Senior Watson assigned, Daml/Canton primers for researchers, contest launched and announced, scope approved by Tech & Ops Committee

### Milestone 2: Contest Execution

- **Estimated Delivery:** Depending on the chosen scope
- **Focus:** Run the contest
- **Deliverables:** Lead Senior Watson completes full scope review, open contest runs 14 to 28 days with Sherlock's researcher community, all submissions collected, participation metrics (researcher count, submissions, severity distribution) delivered

### Milestone 3: Judging, Report & Fix Review

- **Estimated Delivery:** 1.5 weeks after M2
- **Focus:** Deliver findings and verify all fixes
- **Deliverables:** Deduplicated severity-classified report delivered to the Tech & Ops Committee, remediation guidance for every issue, Lead Senior Watson personally reviews and signs off on all patches

### Milestone 4: Publication

- **Estimated Delivery:** 2 weeks after M3
- **Focus:** Publish all outputs
- **Deliverables:** Public security report, Daml security patterns guide (the first one to exist), researcher performance data shared with Canton Foundation for future engagements

## Acceptance Criteria

The Tech & Ops Committee evaluates completion based on deliverables per milestone, meaningful contest participation with validated findings, and the published report and patterns guide. Scope must be approved by the Committee before the contest launches (M1 gate), findings use Sherlock's severity framework (Critical / High / Medium / Low / Informational), fix review is completed by the Lead Senior Watson personally, and the patterns guide is reviewed by a Canton/Daml domain expert before publication.

## Funding

**Total:** 75,000 to 295,000 USD equivalent in Canton Coin ($CC), with the final amount determined after scoping based on what's included.

## Co-Marketing

Joint announcement of the contest launch and results, a technical blog post covering findings and Daml-specific security insights, and cross-promotion to Sherlock's researcher community to drive awareness of Canton.

## Motivation

Security coverage on Canton today is one auditor team checking one component against one spec, the talent pool that can audit Daml is small, and there's no published resource on what Daml-specific vulnerabilities look like. This contest reviews the broader stack, gives hundreds of researchers hands-on Daml experience through a real engagement with real incentives, and produces the first security patterns guide for the language. Every researcher who participates becomes someone who can do Canton security work going forward.

## Rationale

**Why a contest?** Canton wants to discover who's good at security on this stack while also growing Daml competency across the researcher community, and a contest does both at once by putting 300 to 800 people on the codebase instead of 2 to 4. The Ethereum Foundation used the same approach for Fusaka's final pre-mainnet review.

**Why Sherlock?** The Lead Senior Watson pool includes auditors with 10+ years of Haskell experience who read Daml natively, alongside cryptographic and privacy specialists who've audited Aleo, Brevis, Pico, MegaETH, and Axal, and infrastructure researchers who've worked on full L1 networks and cross-chain protocols. Sherlock ran the Fusaka contest ($2M, 510+ researchers), secures Aave ($60B+) and Sky, and supports $250B+ in protocol TVL.
