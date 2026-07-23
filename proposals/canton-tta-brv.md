## Proposal: Korean TTA Blockchain Reliability Verification of the Canton Private Synchronizer

- **Author:** John Yang (Nodeinfra)
- **Status:** Draft
- **Created:** 2026-06-08
- **Label:** regulatory-compliance
- **Champion:** Teagan Buckley

---

## Abstract

This proposal requests funding to take the Canton private synchronizer through Korea's TTA [Blockchain Reliability Verification](https://www.tta.or.kr/eng/contents?contentId=316&key=361) (BRV, 블록체인 신뢰성 검증) ahead of Korea's incoming permissioned-DLT regime: the STO law effective January 2027, and the Digital Asset Basic Act for KRW stablecoins alongside the Bank of Korea's CBDC and deposit-token pilots, phasing in over the next few years. BRV is TTA's blockchain-specific reliability and security evaluation, and its evaluation framework is built on the National Cyber Security Center's [「국가ㆍ공공기관 도입을 위한 블록체인 암호기술 가이드라인」](https://www.ncsc.go.kr/ko/main/PageLink.html?token=MDEyMzQ1Njc4OWFiY2RlZrBvBnCd4cC_Aqu-HrYk1bi4IwVbci5a1FamchlW1qNssCyKZu6ZLfUXAiW9SUOAvJFDIeiLbKBRCExqbnRsQrVylvf-KY7TVFMyWcr3saQP) (Blockchain Cryptographic Technology Guideline for Adoption by National & Public Institutions, 2020.12), a permissioned-blockchain security standard co-authored by the National Intelligence Service, the Ministry of Science and ICT, the National Security Research Institute, and TTA. That guideline is the standard against which Korea's financial-infrastructure operators evaluate a permissioned chain, and BRV is the most credible blockchain-specific reliability credential available for chain eligibility.

Nodeinfra, a Korea-based Daml/Canton firm with prior blockchain-TTA experience, is already engaged with the Canton Foundation and two leading Korean financial groups to build STO issuance platforms on Canton (counterparties under strict NDA); none of it productionizes until the chain itself is verified, in a market that does not yet distinguish Canton's permissioned substrate from public-chain alternatives. Critically, the BRV result attaches to the Canton private synchronizer software, not to Nodeinfra or any single operator, so every ecosystem participant inherits it: a public good, not a private commercial asset. Because it attaches to the software rather than any one use case, the same verified synchronizer serves Korea's regulated-DLT domains as equals: STO under the Electronic Securities Act, and KRW stablecoin and Bank of Korea CBDC and deposit-token settlement under the Digital Asset Basic Act, all under the same NCSC guideline. We open-source the verified deployment configuration and stack under Apache 2.0 so other vendors can stand up the same stack and propose Canton in analogous regimes across Japan, Taiwan, Hong Kong, and other APAC jurisdictions.

---

## Impact

Korean institutions are making their first DLT choices now, across three fronts at once: securities firms ahead of the January 2027 STO deadline, and banks and the Bank of Korea as KRW stablecoin and CBDC rails take shape behind it. Those choices lock in the underlying infrastructure for decades, and selection is defaulting toward Hyperledger Besu and Fabric.

The Electronic Securities Act (STO) and the Digital Asset Basic Act (KRW stablecoins, alongside the Bank of Korea's CBDC and deposit-token pilots) run on the same permissioned substrate, selected by the same operators, in the same buildout window. A BRV credential now positions Canton across all three together.

This credential is what puts Canton in front of them before that default hardens. The Canton Foundation can verify (under NDA) that a Korean financial authority has confirmed the importance of this credential.

---

## Motivation

Korean STO regulation is now law. The 「전자증권법」 (Electronic Securities Act) and 「자본시장법」 (Capital Markets Act) amendments passed the National Assembly on 2026-01-15 and take effect in January 2027. For the first time, distributed ledgers have legal status as the "electronic registration account book" (전자등록계좌부). This creates a hard, dated ~12-month window before STO issuance and trading can begin. The Digital Asset Basic Act is advancing in parallel, extending the same permissioned-DLT push to KRW stablecoins and the Bank of Korea's CBDC and deposit-token work over the next few years.

The market this opens is large and concrete. BCG projects Korean tokenized securities at KRW 119T (~USD 85B) by 2026, KRW 233T by 2028, and KRW 367T (~USD 265B) by 2030, 14.5% of Korean GDP (BCG forecast, as reported in the Korean financial press, 2026). These figures are at the optimistic end of tokenization forecasts; the case for verification holds well below them. KDX (KRX-led) and NXT (Nextrade-led) consortia have already been selected by the FSC as preliminary OTC trading platform operators. Securities firms (Mirae, Shinhan, NH, KB, and others) are racing to lock in infrastructure choices now, well before the effective date.

By design, Korean regulation pushes this market onto private (permissioned) blockchains. The amended Electronic Securities Act preserves total-supply oversight and right-presumption rules that are structurally hard to square with public-chain issuance. The Canton private synchronizer is a strong structural fit: permissioned, privacy-preserving, deterministic finality.

The regime is also structurally two-layered, and this matters for who actually selects the chain. Settlement and registration infrastructure is operated by a small set of statutorily-recognized financial institutions: KSD (한국예탁결제원), FSI (금융보안원), KFTC (금융결제원), and additional public-interest financial bodies designated under the Electronic Securities Act framework. Securities firms, banks, and asset managers participate as application-layer counterparties on top of that infrastructure, not as operators of it. For a permissioned chain to fit the regime, its validator set has to sit at the infrastructure-operator layer. A BFT consensus distributed across three or more of these institutions is precisely the trust model Korean regulators expect from a private chain. Canton's private synchronizer with sub-net architecture maps onto this structure directly.

But fit is not recognition. The dominant private-blockchain infrastructures in Korea today are Hyperledger Besu and Hyperledger Fabric. Those are the defaults Korean regulators, securities firms, and systems integrators reach for when they think "permissioned blockchain." Canton, despite having a structurally superior private-synchronizer option for exactly this use case, is often mistakenly perceived as just another public-network altcoin. Educating regulators and the market that Canton's private synchronizer exists, and that it is the right substrate for Korean STO issuance, is itself a meaningful part of the work this grant funds.

Korean regulation does not strictly mandate any particular verification, but in a market with this level of misperception, TTA BRV is the most credible way to put Canton on equal footing with the Besu/Fabric defaults, and the only path that tests the exact security properties infrastructure operators care about. Its framework is built on the National Cyber Security Center guideline that the security and compliance teams at KSD, FSI, and KFTC apply when assessing a permissioned chain, setting concrete requirements across cryptographic usage, key management, data-transmission security, consensus, ledger integrity, and smart contracts. That scope is institution-wide, so the same evaluation governs STO, KRW stablecoin, and Bank of Korea CBDC chains alike and answers the chain-security question for all three at once. That BRV is blockchain-specific is the point: direct evidence on consensus fault tolerance, key management, and ledger integrity, not a generic enterprise-software seal.

Demand is not hypothetical: the two financial-group engagements noted above are already waiting on a verified chain.

No DLT has completed BRV with a privacy-preserving sub-net architecture, and no foreign chain has obtained it at all. The framework is Korea-specific, no other DLT aligns with the amended Electronic Securities Act the way Canton does, and the STO framework was only finalized in January 2026. Canton would be the first, entering the buildout window with a credential nobody else holds just as institutions choose the substrate they will run on for the next decade.

The strategic payoff extends beyond Korea in three dimensions. First, ecosystem lock-in: institutions onboard onto the private synchronizer now, while regulation requires permissioned substrates, and are positioned to extend onto the global Canton synchronizer and align with CC once Korean rules permit cross-domain interop. Same chain, same software, same trust model; only the synchronizer scope changes. Second, APAC blueprint: the open-sourced reference deployment is portable, so the marginal cost of clearing analogous verifications in Japan, Taiwan, Hong Kong, and other regulated markets drops substantially. Third, parallel domains at home: STO, KRW stablecoin, and Bank of Korea CBDC rails run on the same synchronizer from the start, so one credential seeds all three.

---

## Specification

### 1. Objective

Take the Canton private synchronizer through Korea's TTA BRV, publish the verification result, and open-source the verified deployment configuration and stack under Apache 2.0 as a reusable APAC blueprint.

The intended outcome: while Korean infrastructure selection is happening (STO through January 2027, with KRW stablecoin and CBDC rails following), the Canton private synchronizer holds a credential recognizable to the procurement, risk, and compliance teams at KSD, FSI, KFTC, and peer operators, and to their counterparts standing up the stablecoin and CBDC rails, since those decisions sit with the same institutions. It attaches to the software, so every team building on the synchronizer inherits it, and the artifacts to clear analogous regimes elsewhere are public under Apache 2.0.

### 2. Implementation Mechanics

Work breaks into three phases, each part of a single end-to-end verification cycle:

1. **Scope confirmation with TTA.** Engage TTA and confirm the BRV evaluation scope for the Canton private synchronizer against the NCSC guideline's requirement areas. The evaluation scope and the detailed guideline-to-test-item mapping are TTA-confidential and are not published.

2. **Evaluation submission preparation.** Build the reproducible verification environment (deployment scripts, NUMA-aware host configuration, Postgres backing, Canton 3.x runtime), the test harness covering the reliability and security criteria, and the documentation set required for TTA evaluation. Open the public GitHub repo for the open-source artifacts at this stage.

3. **TTA evaluation cycle.** Submit, respond to findings through the standard TTA evaluation cadence (~2-month formal evaluation, with potential gap-closing work between rounds), and shepherd the package through to an issued verification result.

**Verification target**: what TTA will verify about the Canton private synchronizer:

| Company / Developer | Platform / Solution | TTA Verification Type | Key Verified Metrics |
|---|---|---|---|
| Nodeinfra, for the Canton Foundation ecosystem | Canton Private Network | Blockchain Reliability Verification | Demonstrated TPS scalability; BFT fault tolerance and total-supply preservation; account and key-management security; smart-contract and source-code security; privacy-preserving sub-net architecture; node-role separation aligned with the amended Electronic Securities Act |

Supporting notes:

- **Electronic Securities Act alignment:** the verification maps directly onto the Act's structure. BFT fault tolerance and total-supply preservation under node faults map onto the Act's total-supply oversight and right-presumption rules; account and key management map onto the issuer, registrar, and account-management institution roles; ledger integrity maps onto right-presumption. The verification is a literal demonstration of regulatory fit, not a generic enterprise-software seal.
- **NCSC guideline as the evaluation backbone:** the guideline targets permissioned blockchains adopted by national and public institutions, and the Canton private synchronizer is assessed directly against its requirements.
- **Privacy as differentiator:** Canton's privacy-preserving sub-net architecture is the property no other Korean private-chain precedent has. The Korean STO market is converging on permissioned chains specifically because of the total-supply oversight and right-presumption rules. Canton is the only candidate whose privacy model is structurally aligned with them.
- **Throughput approach:** Canton's throughput capacity has been independently demonstrated by [Proof Group at ~100K TPS in a 12-hour lab benchmark](https://lists.sync.global/g/tech-ops/message/109) on bare-metal infrastructure for a fellow Super Validator's use case. The benchmark ran on 10 machines with 4 synchronizers, 17 participants, and 824 cores on Canton 3.5.0, using Daml asset transfers with full interpretation, atomic settlement, and per-stakeholder encrypted view trees. For this grant, Nodeinfra will build a TTA-tailored evaluation environment and benchmark harness on top of the upstream [Canton open-source performance benchmark suite](https://github.com/digital-asset/canton/blob/main/performance/README-xfer.md), the same open-source tooling Proof Group's fork leveraged. The harness is purpose-built for performance and reliability reproducibility against the BRV criteria, and ships as a substantive engineering artifact in the open-source release.
- **Cross-domain applicability:** the properties BRV verifies (BFT fault tolerance, total-supply preservation, key management, ledger integrity) are exactly what STO issuance, KRW stablecoin settlement, and Bank of Korea CBDC and deposit-token networks each require, so the verified synchronizer is production-ready across all three domains.

**Open-source surface (Apache 2.0).** The centerpiece is the TTA-verified Canton deployment configuration and stack: a runnable, self-built artifact other vendors can stand up and reuse to propose Canton in their own jurisdiction. Every published artifact is Nodeinfra-authored deployment, configuration, or harness code we build for the evaluation; none reproduces TTA's evaluation material.

- TTA-verified deployment configuration and stack: the exact self-built deployment that cleared BRV, covering deployment and configuration scripts, NUMA-aware host tuning, Postgres backing, and the pinned Canton 3.x runtime substrate. This is the reusable core.
- Benchmark harness, built on the upstream Canton performance suite: a Nodeinfra-authored tool that lets any third party re-run the stack and produce its own performance and reliability metrics.
- Test harness (Nodeinfra-authored), published subject to consultation with TTA and scrubbed of anything that would reveal TTA test contents; scope confirmed at kickoff.
- Engineering post-mortem describing findings, fixes, and the engineering work required to pass.

Not published (TTA-confidential): the submission package, the evaluation checklist, the detailed guideline-to-test-item mapping, the detailed test contents, and the result report. Per TTA, the BRV result and the headline verified metrics are publicly citable subject to prior consultation with TTA; the proposal claims publication only of which guideline requirements were verified, not the detailed mapping behind them.

Informed by TTA's written confirmation that Nodeinfra-authored deployment scripts, configuration, and benchmark harness are publishable (with the test harness publishable subject to consultation), while the submission package, the guideline-to-test mapping, the detailed test contents, and the result report are confidential, the NDA carve-out plan naming exactly what will and will not be open-sourced is finalized at the start of Milestone 1 and is a precondition for Milestone 1 acceptance. The open-source surface is therefore defined and accepted before any payment, not promised afterward.

### 3. Validator Architecture

The Canton private synchronizer is intended to operate under a BFT validator set composed of Korea's statutorily-recognized financial infrastructure institutions, the same operator tier that anchors STO, KRW stablecoin, and CBDC alike. Expected core participants, spanning all three domains:

- **KSD** (Korea Securities Depository, 한국예탁결제원): electronic registration and settlement anchor for tokenized securities
- **BOK** (Bank of Korea, 한국은행): central-bank settlement authority and anchor for wholesale CBDC and deposit tokens
- **FSI** (Financial Security Institute, 금융보안원): financial-sector cybersecurity authority across all three domains
- **KFTC** (Korea Financial Telecommunications & Clearings Institute, 금융결제원): interbank clearing and settlement infrastructure, central to KRW stablecoin rails

Additional candidate validators may be drawn from public-interest financial bodies designated under the relevant statutory frameworks (e.g., KRX, Koscom, KSFC). Final composition is a regulatory and governance decision that varies by domain and is outside the scope of this grant; the verification work itself is validator-agnostic.

This validator architecture is a stronger institutional story than a securities-firm-operated chain. The core institutions cover distinct verticals (central bank, depository, security, clearing) with no cross-ownership and no shared commercial counterparties, so commercially-motivated collusion against the BFT 51% rule is not a realistic compromise vector. Securities firms, banks, stablecoin issuers, and asset managers transact on the network as application-layer participants, not as consensus operators. This preserves the separation of duties Korean regulation draws between issuer, registrar, and account-management roles and the infrastructure operators, whether the rail carries securities, stablecoins, or CBDC.

This is also where the case for BRV specifically lives. The operator tier evaluates a permissioned chain against the NCSC guideline, which BRV operationalizes; independent audits and ISO 27001 serve only as general supporting evidence. Whether BRV becomes a formal requirement is still being settled in the KSD-led standards work, but as a recognized blockchain-specific verification it is the credential most likely to be relied on, and the one that puts Canton on equal footing with the Besu/Fabric defaults.

### 4. Architectural Alignment

The verification work validates existing Canton private synchronizer architecture; it does not modify protocol behavior. Specifically:

- The privacy sub-net model, BFT consensus, and deterministic finality being verified are upstream Canton properties; the verification asserts what already exists.
- Gap-closing engineering, if any, is configuration- and deployment-side (test harness, observability, deployment hardening), not protocol-side.
- Any protocol-side gap surfaced by TTA evaluation will be raised upstream through standard Canton CIP and release processes, not as part of this grant deliverable.
- This work is directly aligned with the multi-synchronizer roadmap, demonstrating the Canton private synchronizer as a regulated production substrate in a major jurisdiction, strengthening the case for the same architecture across other jurisdictions.
- The vision is a single private synchronizer carrying multiple regulated domains (securities, stablecoins, and CBDC) under one institutional validator set, so a single verified substrate serves all of them rather than a separate chain per domain. Verifying the synchronizer once, against the guideline all three domains share, is what makes that vision concrete.

### 5. Backward Compatibility

No backward compatibility impact. The verification work does not modify Canton protocol, ledger semantics, or existing integration surfaces. Existing deployments, applications, and dependent systems are unaffected.

---

## Milestones and Deliverables

### Milestone 1: Kickoff and TTA Engagement

- **Estimated Delivery:** 1–2 months after grant approval
- **Focus:** Confirm BRV evaluation scope with TTA against the NCSC guideline, confirm with TTA the publication scope for the reference deployment, and open the public GitHub repo for the reference deployment.
- **Deliverables and Value Metrics:**
  - Confirmation from TTA that it is ready to begin BRV of the Canton private synchronizer, verifiable by the Tech & Ops Committee (under NDA where TTA requires)
  - Public GitHub repository established under Apache 2.0
  - Published reference-deployment outline (the deployment configuration and stack to be verified, plus the metrics-reproduction plan)
  - Published NDA carve-out plan naming what will and will not be open-sourced, delivered and accepted before Milestone 1 payment

### Milestone 2: Blockchain Reliability Verification Issued

- **Estimated Delivery:** ~5 months after grant approval
- **Focus:** Submission, evaluation cycle response, gap-closing engineering, verification result issuance.
- **Deliverables and Value Metrics:**
  - TTA-issued BRV result for the Canton private synchronizer
  - The TTA-verified Canton deployment configuration and stack published to repo (deployment and configuration scripts, host tuning, pinned Canton runtime, the benchmark harness, the test harness subject to TTA consultation, and the post-mortem)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **Milestone 1:**
  - TTA confirmation that it is ready to begin BRV of the Canton private synchronizer, verifiable by the Committee under NDA
  - Public repository established under Apache 2.0, with the reference-deployment outline published
  - NDA carve-out plan delivered and accepted (a precondition for Milestone 1 payment)
  - If the open-source surface is inadequate, grantor and grantee re-scope before payment
- **Milestone 2:**
  - TTA-issued BRV result, publicly verifiable
  - All named non-NDA artifacts published under Apache 2.0
  - Post-mortem published describing findings and engineering work
- **Ecosystem value indicators (informational, not gate; these are the adoption metrics defined in Growth and Adoption):**
  - Canton private synchronizer cited in RFPs, PoCs, or technical evaluations at KSD, FSI, KFTC, or peer infrastructure institutions designated under the Electronic Securities Act framework, or in downstream Korean securities-firm STO infrastructure selection processes.
  - The verified reference deployment referenced or reused by at least one team pursuing analogous verification in another jurisdiction (Japan, Taiwan, Hong Kong, or comparable) within 12 months of result issuance.

Note on artifact-style gates: the verification result is by nature binary: Canton either holds a passing BRV result or it doesn't. Without it, Canton enters infrastructure selection without the blockchain-specific credential its competitors will be measured against; with it, Canton is in the selection pool on equal footing. The Milestone 2 gate accordingly conditions payment on the credential itself rather than on downstream adoption. The 12-month ecosystem indicators are tracked separately as the lagged adoption outcomes the credential unlocks.

Scheduled adoption reporting: although these indicators do not gate payment, Nodeinfra commits to publishing a public adoption-tracking update in the GitHub repo at 6 and 12 months after BRV result issuance, reporting progress against the ecosystem value indicators above (operator-tier and securities-firm citations; cross-jurisdiction artifact reuse). This makes adoption accountable on a fixed schedule without conditioning grant payment on outcomes outside the grantee's control.

---

## Funding

**Total Funding Request:** 2,750,000 CC (~$330,000 USD at the $0.12/CC reference rate; funding is denominated and paid in CC, see Volatility Stipulation).

### Payment Breakdown by Milestone

| Milestone | Payment on Acceptance |
|---|---|
| Milestone 1: Kickoff and TTA Engagement | 467,000 CC |
| Milestone 2: Blockchain Reliability Verification Issued | 2,283,000 CC |
| **Total** | **2,750,000 CC** |

### Indicative Line-Item Breakdown

The $330,000 (2,750,000 CC) ask decomposes approximately as follows:

| Line item | Headcount | Rate | Duration | USD | CC (@$0.12) |
|---|---|---|---|---|---|
| Blockchain engineers | 4 | ~$11K/mo loaded | 5 months | $220,000 | 1,834,000 CC |
| Security engineer | 1 | ~$12K/mo loaded | 5 months | $60,000 | 500,000 CC |
| Admin (partial allocation) | 1 | ~$2,000/mo | 5 months | $10,000 | 83,000 CC |
| Infrastructure (cloud) | — | — | 5 months | $25,000 | 208,000 CC |
| TTA evaluation fee | — | — | — | $15,000 | 125,000 CC |
| **Total** | | | | **$330,000** | **2,750,000 CC** |

Caveats:

- Rates shown reflect compensation for engineers with the specialized Canton, Daml, and Korean TTA-process expertise this verification requires; actual compensation is set by Nodeinfra.
- Labor reflects partial grant-coverage of total team time; Nodeinfra commercial revenue (NaaS + active engagements) covers the remainder.
- BRV is a paid evaluation; the team budgets for the full evaluation fee. The figure shown is an estimate, confirmed against TTA's actual quote during Milestone 1 scope confirmation.
- Infrastructure is for the cloud-based verification environment over the 5-month evaluation cycle.
- If TTA's actual quote materially exceeds the estimate, the difference is absorbed from contingency in the labor line; Nodeinfra carries the residual.

### Volatility Stipulation

Project duration is targeted at approximately 5 months. Should the project timeline extend beyond 5 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

External delays (e.g., TTA-side evaluation timeline) do not trigger renegotiation; the team accepts that volatility risk and reports transparently in monthly status updates.

### Funding Rationale

- **467,000 CC at Milestone 1 (~17% of total)** covers TTA evaluation fees, infrastructure costs for the verification environment (cloud), and a portion of the engineering resources required during the ~2-month evaluation preparation and submission cycle (test harness build, deployment hardening, documentation set). The kickoff payment is intentionally bounded: it sustains the team into the formal evaluation phase but is not a reward for "engagement"; the bulk of value is concentrated in the actual verification result.
- **2,283,000 CC at Milestone 2 (~83% of total)** is conditioned on the deliverable that creates ecosystem value: a publicly-verifiable BRV result plus the full open-source artifact set. This recovers the remaining engineering and infrastructure expense (cloud) from the verification cycle. It also sustains Nodeinfra's runway as it continues its separate, commercial work onboarding leading Korean financial groups onto the now-verified Canton private synchronizer. That onboarding work itself is out of scope (see *Out of Scope* below).
- **Why 1:5 weighting rather than 1:1**: the verification result is binary. Either the Canton private synchronizer holds a passing BRV result or it doesn't. The committee is paying for that credential, not for incremental progress, and the funding structure reflects that.

---

## Out of Scope

This grant does not fund:

- Productization of an STO, stablecoin, or CBDC platform on top of the synchronizer
- Commercial and BD work with Korean securities firms (a separate Nodeinfra commercial workstream)
- Legal and regulatory education engagement with a Korean law firm (the compliance-opinion and briefing workstream described under Growth and Adoption, funded separately, not by this grant)
- TTA GS Class 1 certification (the general software-quality seal under the Software Promotion Act), a useful complementary credential pursued separately as a potential follow-on, not part of this grant
- Re-verification or annual re-verification beyond initial issuance (repository maintenance itself continues under Nodeinfra's APAC practice, see Sustainability)
- Korean legal-entity setup or other corporate or regulatory infrastructure outside the verification itself

---

## Licensing

All open-source artifacts produced under this grant (the TTA-verified deployment configuration and stack, deployment and configuration scripts, host tuning, pinned Canton runtime substrate, the TTA-tailored benchmark harness, the test harness where TTA consultation permits, and the post-mortem) will be released under the Apache License 2.0.

---

## Sustainability

The BRV result is a standing, issued credential: once granted it requires no ongoing funding to remain valid for the infrastructure-selection window it targets.

Nodeinfra maintains the public Apache 2.0 repository (the verified deployment configuration and stack, deployment scripts, benchmark harness, and the test harness where publishable) as a standing asset of its commercial APAC verification practice, so upkeep is self-funded beyond the grant rather than abandoned at close.

Any protocol-side gap surfaced after issuance is routed to upstream Canton maintainers through the standard CIP and release process, with Nodeinfra acting as the reporting party given its production operational experience.

Re-verification or annual renewal, if a future Korean rule requires it, is a separate engagement and is not funded here. See Out of Scope.

---

## Co-Marketing

Upon verification result issuance, Nodeinfra will collaborate with the Canton Foundation on:

- **Joint announcement** of BRV in both English and Korean
- **Technical blog** documenting the verification journey at a publishable level (which NCSC-guideline requirement areas Canton was verified against, not the confidential test mapping) and the reusable deployment lessons for analogous verification regimes
- **Korean-press outreach** (전자신문, 보안뉴스, 한국경제, etc.): Korean-language explainer positioning Canton across Korea's digital-asset infrastructure landscape (STO, KRW stablecoin, and CBDC), co-branded with Canton Foundation
- **Ecosystem presentations** at Korean blockchain and FinTech events and at Canton-related conferences
- **Verified-stack open-sourcing as marketing**: the public Apache 2.0 deployment configuration and stack is itself co-marketing material, showing a runnable, verification-ready Canton substrate to non-Korean APAC markets (the submission package itself stays confidential per TTA)

---

## Growth and Adoption

Adoption runs on two main strategies that reach the same downstream buyers from opposite directions, plus a third that extends the work across APAC. The shared obstacle all three overcome is the market's current misperception of Canton as "just another public-chain altcoin" rather than a permissioned substrate for STO, KRW stablecoin, and CBDC settlement alike.

### Strategy 1 (top-down): operator-tier selection and blessing

The infrastructure-operator tier (KSD, FSI, KFTC, and peer institutions designated under the Electronic Securities Act framework) selects the chain first. The issued BRV result enters their procurement and technical-review workflows as a recognized blockchain-specific credential, the same credential their security and compliance teams apply against the NCSC guideline. Once an operator-tier institution selects and blesses the Canton private synchronizer, that decision cascades downward: securities firms, banks, and asset managers inherit the selection as application-layer participants without re-running chain-level diligence. The same operator tier stands behind Korea's stablecoin and CBDC rails, so one operator-tier blessing spans STO, stablecoin, and CBDC as a single decision.

### Strategy 2 (bottom-up): Nodeinfra's STO platform and securities-firm pull

In parallel, Nodeinfra builds a full-stack Korean STO issuance platform on top of the TTA-verified Canton private synchronizer, serving as the first production adopter of the credential this grant produces. This platform is a separate, commercially-funded Nodeinfra workstream (see Out of Scope); the grant funds the public credential, not the platform, but it provides concrete, near-term proof that verification converts into real issuance activity on Canton rather than remaining a paper credential. Nodeinfra leverages its two leading Korean financial-group engagements (counterparties under NDA) as launch customers, and its established relationships with top Korean securities firms to generate demand-side pull across the application layer.

The two reinforce each other: securities firms are reached from above by an operator-blessed credential and from below by a working platform they can issue on today, meeting at the layer where the bulk of STO issuance volume will sit.

### Strategy 3 (outward): APAC blueprint

The open-source Apache 2.0 artifacts are structured for portability. Once the playbook exists, the marginal cost of clearing analogous verifications in Japan, Taiwan, Hong Kong, and other regulated APAC markets drops substantially, extending Canton's reach beyond Korea at zero additional ecosystem cost.

### Regulatory & legal education (law-firm partner)

Cutting across both the top-down and bottom-up strategies, Nodeinfra will engage a Korean law firm with securities and digital-asset expertise to produce an independent legal compliance analysis: a written opinion mapping the Canton private synchronizer (and the BRV credential it carries) onto the Electronic Securities Act, the Capital Markets Act amendments, and the NCSC guideline. This addresses the core obstacle named above: regulators, KSD, and securities-firm risk committees need a neutral, third-party legal interpretation confirming that Canton's permissioned, privacy-preserving architecture satisfies the total-supply-oversight and right-presumption rules, rather than relying on a vendor's claim that it does. This legal engagement is a separate, complementary workstream funded outside this grant (see Out of Scope), but Nodeinfra intends to publish the resulting analysis as a citable reference and use it as the basis for educational briefings to KSD, the FSC or FSS where appropriate, and downstream securities firms, delivered jointly with the Canton Foundation (see Co-Marketing).

### Discovery and measurement

Discovery runs through the joint Canton Foundation announcement, Korean-press outreach, and ecosystem presentations (see Co-Marketing), with the open-source artifacts as discoverable proof outside Korea. The adoption indicators themselves are defined in Acceptance Criteria and reported publicly at 6 and 12 months post-issuance.

---

## Rationale

**Why BRV over alternative paths.** Several alternatives could in principle deliver some of the same recognition; none deliver all of it.

- **TTA GS Class 1 certification:** more institutionally generic and less blockchain-specific than BRV. GS Class 1 is an ISO/IEC 25051-anchored software-quality seal that certifies general product quality across eight attributes, but it does not test the consensus fault tolerance, key management, and ledger-integrity properties the National Cyber Security Center guideline requires of a permissioned chain. It is a useful complementary credential and a sensible follow-on, but it is not the credential that answers the infrastructure operators' chain-security questions.
- **Independent third-party audit (e.g., Big-4 or specialized blockchain auditor):** produces a report but no standing against the NCSC guideline; cannot clear Korean infrastructure operators' procurement and security workflows, which require a recognized credential rather than a vendor-purchased opinion.
- **Generic enterprise software credentials (ISO 27001, SOC 2):** certify the *operator's* processes, not the chain product itself, and are non-Korean credentials with no hook into the Electronic Securities Act or the NCSC guideline. Useful complements; not a substitute.
- **FSC regulatory-sandbox pilot:** running an actual STO under the FSC sandbox is possible, but takes ~12 months minimum and operates under sandbox-set scope constraints. The result is one-off for the participating issuer, not a transferable credential other firms can rely on.
- **Marketing or education campaign only:** addresses the Canton-as-altcoin misperception but lacks an institutional anchor; securities-firm risk committees need a verifiable third-party signal to point to in their selection process.

BRV is the only path that simultaneously provides three things: a blockchain-specific evaluation against the NCSC guideline that underpins infrastructure-operator security review; the credential that public-sector and quasi-public procurement at KSD, FSI, KFTC, and peer infrastructure operators applies; and a transferable credential that downstream securities firms, banks, stablecoin issuers, and asset managers inherit without separate re-engagement.

**Why open-source over proprietary.** Much of the verified deployment configuration and stack is portable to other jurisdictions. Keeping it proprietary would protect Nodeinfra's incremental edge by a few quarters at most; releasing it under Apache 2.0 multiplies Canton's reach across APAC at zero marginal cost to the ecosystem. The APAC blueprint is, in many ways, the strongest part of this proposal, and it only exists if the artifacts are open.

**Why now versus later.** The Korean STO law's January 2027 effective date is hard. Infrastructure-operator selection at KSD, FSI, KFTC, and peer institutions runs ahead of downstream securities-firm onboarding by 6–12 months. The operators are sequencing decisions now, well before the law takes effect, because production rollouts take time. A chain verified in late 2027 is too late; a chain verified by Q4 2026 or early Q1 2027 is in the selection pool at the tier where the decision is actually made. The Digital Asset Basic Act follows behind, bringing KRW stablecoin and Bank of Korea CBDC rails onto the same operators in the same window, so a credential earned now lands ahead of all of those decisions together. The 5-month delivery window of this grant is matched to that timing.

**Why Nodeinfra.** Nodeinfra is one of the very few independent, vendor-agnostic teams in Korea with prior successful TTA verifications for blockchain infrastructure (via the Korean government's TIPS program). Most TTA blockchain experience lives inside Korean-built L1 vendors (Aergo, loopchain, etc.). Shepherding a non-Korean DLT through BRV is a fundamentally different exercise. The team's combination of TTA process experience, Korean financial counterparty relationships, and direct Canton operational experience is uniquely matched to it.

**Timing and posture alternatives.** Waiting for FSC subordinate regulations to name a credential misses the buildout window: the chains verified before the rules finalize are the ones already selected. Doing nothing and letting Canton win on merit ignores the misperception problem, which will not self-correct in time.

---

## Team

**Nodeinfra**: a Daml software development firm and Canton NaaS (Node-as-a-Service) provider based in Korea, currently operating 4 Canton nodes in production. Four blockchain engineers and one security engineer will be allocated full-time to this verification.

- Prior TTA verification experience, specifically for blockchain infrastructures. Nodeinfra has successfully completed TTA verifications for blockchain infrastructure as part of the Korean government's TIPS (Tech Incubator Program for Startups) program. TTA's blockchain-specific verification practice is recent. The number of teams that have shepherded a blockchain stack through evaluation end-to-end is small, and almost all of them are inside chains that own their own Korean-built L1s (Aergo, loopchain, etc.). Nodeinfra is one of the few independent, vendor-agnostic teams with this experience.
- Building [Musubi Network](https://musubinetwork.com/) with SBI Digital Practice, Canton-native infrastructure for FX trading and stablecoin settlement (including JPYSC, the SBI and Startale Japanese-yen stablecoin), demonstrating production Canton and Daml capabilities. This is direct production experience with stablecoin settlement on Canton, transferable to a KRW stablecoin on the same verified synchronizer.
- Currently building two tokenization platforms for two leading Korean financial groups (counterparties under strict NDA).
- Direct operational experience with the Canton private synchronizer in production, covering the deployment, monitoring, and key-management posture that a BRV evaluation will scrutinize.
- Established working relationships with Korean financial counterparties at the application layer (securities firms, financial groups); infrastructure-operator engagement (KSD, FSI, KFTC, and peer institutions) initiated through this grant and the TTA verification process.

**John Yang, CEO and Founder, Nodeinfra**: [johnyangk.github.io](https://johnyangk.github.io/)

- First author of papers at top systems and computer-science conferences (OSDI, USENIX ATC, EuroSys). Brings the systems-engineering depth required to map Canton's architecture onto the NCSC guideline's reliability and security requirements and to lead the evaluation-response cycle credibly.

---

## Risks and Mitigations

- **TTA finds a gap in upstream Canton (not our integration).** Mitigation: internal pre-submission review using Nodeinfra's production-Canton operational experience to surface obvious gaps before formal submission; escalation path to upstream Canton maintainers documented at kickoff for anything we can't close ourselves.
- **Cryptographic-conformance gap against the NCSC guideline.** The guideline recommends KCMVP-validated algorithms while also permitting standards-body algorithms (ISO/IEC, IETF). Mitigation: check Canton's cryptographic primitives against both the KCMVP set and the standards-body allowance during pre-submission review; any genuine gap is raised upstream through standard Canton processes rather than treated as a grant deliverable.
- **NDA and confidentiality surface larger than expected.** Mitigation: the carve-out plan naming the open-source surface is delivered and accepted before Milestone 1 payment; if the surface is inadequate, grantor and grantee re-scope before payment rather than after.
- **Verification timeline slips beyond 5 months due to TTA-side delays.** Mitigation: monthly public status updates in the GitHub repo; per Volatility Stipulation, external delays do not trigger renegotiation. The team accepts that volatility risk.
- **TTA does not issue a passing verification result.** Mitigation: Milestone 2 payment is conditioned on result issuance: if the result is not issued, Milestone 2 does not pay. Milestone 1 funds (already disbursed for kickoff infrastructure, submission preparation, and TTA fees) cover work performed and are non-refundable. In the event of non-issuance, Nodeinfra will publish a public post-mortem documenting the findings and any uncloseable gaps so future submitters can build on the work.
- **Validator set composition differs from the named institutions.** Mitigation: verification is validator-agnostic. The BRV result attaches to the software, not to a roster or to Nodeinfra, so any compliant institutional composition inherits it equally. Final selection is a regulatory decision outside the grant's scope.

---

## References

### Standards & guideline basis

- [국가사이버안보센터 (NCSC) — 「국가ㆍ공공기관 도입을 위한 블록체인 암호기술 가이드라인」 (2020.12)](https://www.ncsc.go.kr/ko/main/PageLink.html?token=MDEyMzQ1Njc4OWFiY2RlZrBvBnCd4cC_Aqu-HrYk1bi4IwVbci5a1FamchlW1qNssCyKZu6ZLfUXAiW9SUOAvJFDIeiLbKBRCExqbnRsQrVylvf-KY7TVFMyWcr3saQP) — Blockchain Cryptographic Technology Guideline for Adoption by National & Public Institutions; co-authored by the NIS, MSIT, the National Security Research Institute, and TTA. The standard underpinning Blockchain Reliability Verification. Local copy: `docs/proposal-ncss.pdf`.
- [TTA — Blockchain Reliability Verification (블록체인 신뢰성 검증)](https://www.tta.or.kr/eng/contents?contentId=316&key=361) — TTA's official description of the verification program.

### Legal & regulatory primary

- [Shin & Kim — 「모든 자산의 토큰화, 토큰증권(STO) 법제화가 가져올 금융혁명」 (2026-01-19)](https://www.shinkim.com/kor/media/newsletter/3076) — primary legal analysis of the 2026-01-15 「전자증권법」 and 「자본시장법」 amendments.

### Market sizing & analyst commentary

- [한국IR협의회 / KIRS 산업분석 (2026-03-27) — 「STO 산업 법제화 마무리, 진검승부의 시작」](https://file.alphasquare.co.kr/media/pdfs/market-report/%EA%B8%B0%ED%83%80STO20260327%ED%95%9C%EA%B5%ADIR%ED%98%91%EC%9D%98%ED%9A%8C.) — analyst report framing 2026 as the start of real competition now that legislation is complete.
- [법률신문 — 화우, 「2026년 대한민국 가상자산산업 10대 핵심 이슈 분석 및 전망」 (2026-01-22)](https://www.lawtimes.co.kr/news/articleView.html?idxno=215219) — top-10 issues from Yoon & Yang law firm.

### Press confirming private-chain consensus and securities-firm activity

- [아시아경제 — 「3년만에 국회 통과한 STO…남은 과제는」 (2026-01-16)](https://www.asiae.co.kr/article/2026011608300223596)
- [서울파이낸스 — 「증권사, STO 시장 선점 경쟁 본격화···인프라 구축 속도」 (2026-03-17)](https://www.seoulfn.com/news/articleView.html?idxno=623796)
- [KB의 생각 — 「토큰증권, STO 법제화」 (2026-02-05)](https://kbthink.com/investment/issues/security-token.html)

### English-language coverage

- [The Block — South Korea approves tokenized securities framework in key legislative hearing](https://www.theblock.co/post/385870/south-korea-tokenized-securities-framework)
- [Seoul Economic Daily — South Korea Ushers in Security Token Era with Landmark Legislation (2026-03-14)](https://en.sedaily.com/society/2026/03/14/south-korea-ushers-in-security-token-era-with-landmark)

### Precedent — prior private-chain TTA verifications in Korea

Canton private synchronizer would be the first non-Korean DLT, and the first privacy-preserving sub-net architecture, to complete TTA BRV.

| Company / Developer | Platform / Solution | TTA Verification Type | Key Verified Metrics |
|---|---|---|---|
| Beatoz | Beatoz Permissioned Network | Blockchain Reliability Verification | 17,700 TPS; stablecoin financial infrastructure; permissioned node stability |
| Heseg (헤세그) | Niktonet | Blockchain Reliability Verification | 3,000+ TPS on proprietary Tendermint-based PBFT+; enterprise data privacy and encryption compliance |
| Hana Financial TI | Hana Group Standard Blockchain Key Management Solution | Blockchain Reliability Verification | Zero-vulnerability architecture for financial networks and STOs; key lifecycle security, account node sandboxing, network fault tolerance |
| SK C&C | ChainZ (체인제트) | TTA V&V (Verification & Validation) | 4,480 TPS native coin; 1,850 TPS smart-contract token under heavy load |
| Coinplug (Metadium) | Metadium Enterprise Platform | TTA Security & Performance Test | 4,258 TPS transaction input; 50,000+ TPS query throughput (2020) |

For reference, prior GS Class 1 certifications of Korean private chains (the complementary software-quality track, pursued separately as a potential follow-on) include Blocko's Aergo Enterprise v2.0, ICONLOOP's loopchain Enterprise, Glosfer's HYCON EP, Leadpoint System's Innoblock, Lambda256's Luniverse, and SecureLink's EdgeChain-based CTTI cyber-threat-intelligence platform.
