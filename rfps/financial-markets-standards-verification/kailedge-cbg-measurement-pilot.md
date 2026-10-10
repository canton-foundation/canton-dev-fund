# Development Fund Proposal

**Author:** Prasad Gopal, Founder, KAILEdge  
**Status:** Draft  
**Created:** 2026-10  
**Label:** financial-workflows-composability  
**Champion:** Parth Chaturvedi (Canton Foundation)  
**RFP Category:** Primary: RWA Standards (RFP 12), area "Daml and Institutional RWA Workflow Standards". Secondary: Public verifiability (RFP 11). No published RFP covers physical-world measurement. If the committee considers the work outside the RFPs, we ask that it be considered as an individual initiative.

---

## Abstract

This proposal funds Phase 1 of a proposed pilot at a Compressed Biogas (CBG) facility at Harohalli, Karnataka, India, operated by Sustainable Impacts. The pilot would build a reference integration from device-sealed plant measurements to Daml contracts on Canton, and release the open-source integration layer.

The total funding request is $120,000 across four tranches. The pilot is planned to run one full production cycle (about 5 months). Dates depend on a signed host-site agreement.

---

## Specification

### 1. Objective

**Problem.** Carbon credit verification is retrospective. Physical production is continuous, but evidence is assembled after the fact from fragmented telemetry, batch sampling and modelling assumptions. Producers wait for verification and buyers get evidence that is hard to check independently.

India's CBG sector: 217 plants were functional as of 31 July 2026 (https://www.thehindubusinessline.com/markets/commodities/india-achieves-105-cbg-blending-in-fy26-ahead-of-1-target/article71314065.ece). The SATAT programme plans 5,000 plants by 2030 (https://pngrb.gov.in/pdf/confluence/SESSION-8-CBG-CELL.pdf).

**Intended outcome.** Show that a hardware-anchored measurement pipeline can run in field conditions and be consumed on Canton, and leave a reusable open reference implementation. The pipeline has three parts:
1. A deterministic physics model running at the edge (design: 62 cross-coupled cellular automata across 21 coupled physical domains).
2. TPM 2.0 hardware-sealed certificates (design: 128-byte records).
3. Daml smart contracts on Canton that verify certificates and support measurement-backed asset workflows.

KAILEdge is a monitoring and verification layer. It does not issue or manage carbon credits. Issuance stays with registries, verifiers and issuers.

### 2. Implementation Mechanics

Three-layer architecture at the Harohalli CBG facility. Sensing is read-only: no actuators and no connection to plant control systems. Measurement is online only.

**Layer 1 - Instrumentation.** PT100 temperature probes (digester, gas line, ambient); pressure transmitters (gas line, compression); pH and ORP electrodes (digester health); methane flow reference measurement; NDIR CH4/CO2 sensors and H2S detectors (trend monitoring); MEMS vibration sensors (equipment health); Modbus energy meters (subsystem power monitoring); feedstock mass measurement.

Measurement classes:
- Class A: reference sensors, calibrated by an NABL-accredited laboratory, used to validate the physics model.
- Class B: operational telemetry, continuous monitoring, not certified.
- Class C: derived quantities computed by the physics engine.

**Layer 2 - Deterministic physics.** 62 cross-coupled cellular automata; 21 physical domains coupled through a 21x21 matrix; 50+ non-linear equations. Target: combined methane mass uncertainty of 8% or less during the pilot. This is a target, not a measured result. T2 characterises the uncertainty from field data.

**Layer 3 - Hardware seal.** The state vector is sealed in TPM 2.0 (PCR 12 extension, SHA3-256 hash, device-bound signature, hardware-anchored identity). Output: a 128-byte certificate designed to be tamper-evident and independently replayable. Trust-minimised, not trustless: calibration, installation and methodology still require trust.

**Canton side (Daml contracts, planned).**
1. Verify the certificate signature and integrity.
2. Record the verified measurement against a measurement-backed asset template.
3. Where a methodology is applied, compute derived quantities (for example CO2-equivalent and conservativeness deduction) as that methodology defines. The methodology is not yet confirmed and depends on the project's registry and verifier.
4. Expose the verified record to a registry, verifier or issuer, who keep issuance authority.
5. Support transfer and retirement workflows through template interfaces. The templates are intended to implement the Canton Network Token Standard (CIP-0056, https://docs.canton.network/overview/reference/cip-0056) interfaces where applicable.

**Edge compute platform.** Intel N305 (8C/8T, 15W TDP), 16 GB RAM, on-board TPM 2.0, fanless IP67-rated enclosure. During connectivity loss, certificates are queued locally.

**Hardware scope.** Three complete sets of 69 devices, 207 devices to be procured under T1. 69 installed live; 138 held as calibrated spares so measurement continues during calibration windows. Status today: specified, supplier quotations being collected, nothing ordered or installed.

**Open and proprietary.** Apache 2.0: Daml templates and interfaces, certificate schema, conformance tests, replay guide. Proprietary: the calibrated physics parameters. A third party can verify a certificate's signature, integrity and chain without KAILEdge software. Reproducing calibrated outputs requires KAILEdge. We are not claiming otherwise.

### 3. Architectural Alignment

**Canton RWA direction.** The pilot would extend Canton's RWA work into measurement-backed environmental assets. The Daml layer is written for multiple issuers, registries and applications, not a single KAILEdge-specific contract.

**Related environmental asset work.** Xpansiv announced a phased initiative to enable tokenization of environmental assets on Canton (https://www.xpansiv.com/xpansiv-to-enable-tokenized-environmental-asset-infrastructure-via-canton-network/). ClimateTrade has announced joining as a network validator (https://www.linkedin.com/posts/climatetrade_activity-7394333673728221184-Korb). KAILEdge's measurement layer is intended to complement platforms like these. Neither has agreed to use it.

**Token standard.** Templates intended to implement CIP-0056 interfaces where applicable.

### 4. Backward Compatibility

No backward compatibility impact. New deployment at a new facility. No change to Canton protocol components.

---

## Milestones and Deliverables

Dates assume a signed host-site agreement with Sustainable Impacts. Month 1 starts at signature.

### Milestone T1: Hardware deployment and first data
- **Estimated Delivery:** Month 1-2
- **Focus:** Get calibrated sensors and edge nodes running at the plant.
- **Deliverables / Value Metrics:** 207 devices procured (three complete sets); 69 installed at the Harohalli CBG facility; edge compute units deployed with TPM 2.0; Class A reference sensors calibrated by an NABL-accredited laboratory; first data transmitted from plant to edge node; first certificates generated and checked on Canton testnet.

### Milestone T2: Physics validation and certificate pipeline
- **Estimated Delivery:** Month 2-3
- **Focus:** Validate the model against field data.
- **Deliverables / Value Metrics:** Physics engine deployed on the edge node; equations calibrated against field data; methane mass uncertainty characterised (target 8% or less); first TPM-sealed certificates verified by independent replay; calibration chain documented.

### Milestone T3: Canton integration
- **Estimated Delivery:** Month 3-4
- **Focus:** Consume certificates on Canton testnet.
- **Deliverables / Value Metrics:** Daml contracts deployed on testnet; certificate verification, measurement-backed asset, transfer and retirement templates; certificates consumed by smart contracts; workflow exercised end to end on testnet.

### Milestone T4: Reference case and acceptance
- **Estimated Delivery:** Month 4-5
- **Focus:** Complete one production cycle and publish the reference case.
- **Deliverables / Value Metrics:** One full production cycle completed; verifier evidence package assembled; reference case published; replay guide and developer documentation delivered; open-source integration layer released; written review of the certificate schema and replay guide sought from at least one registry, verifier or Canton application developer outside KAILEdge, and published in the repository.

---

## Use of Funds (T1, $60,000)
- 207 devices across three complete sets (69 for the live installation plus 138 held as calibrated spares)
- Installation and commissioning at the Harohalli CBG facility
- Calibration of Class A reference sensors by an NABL-accredited laboratory (to be engaged)
- Edge compute units (Intel N305, TPM 2.0, IP67-rated)
- Site engineering and field support during deployment

T2 to T4 cover engineering, calibration analysis, Daml development, documentation and the reference case.

---

## Possible follow-on uses (not funded by this grant, no commitments)

Spot and forward trading of verified carbon credits, tokenized CBG contracts, energy efficiency attestations, NPK-verified fertilizer records, and data tokens built on sealed measurement streams. These depend on registries, issuers and buyers. Nothing in this proposal assumes them.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
1. A reproducible, TPM-sealed certificate is generated from calibrated field sensors at the Harohalli CBG facility.
2. An independent reviewer can replay the certificate from the recorded inputs and model version and verify the hash.
3. The certificate is consumed by a Daml smart contract on Canton testnet.
4. Documentation and knowledge transfer are complete: reference case published, replay guide delivered, open-source integration layer released.
5. The published reference case reports measured results against the stated targets, including where they were missed.

---

## Funding

**Total Funding Request:** $120,000

### Payment Breakdown by Milestone
- T1 Hardware deployment and first data: $60,000 upon committee acceptance
- T2 Physics validation and certificate pipeline: $25,000 upon committee acceptance
- T3 Canton integration: $20,000 upon committee acceptance
- T4 Reference case and acceptance: $15,000 upon final release and acceptance

Our separate Canton Foundation application is under evaluation and is not secured.

### Volatility Stipulation
The project duration is 5 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for USD/CC price volatility.

---

## Sustainability

After the grant period, KAILEdge would maintain the open-source Daml templates, certificate schema and replay guide, and accept outside contributions through the repository. The maintenance period and response commitment are to be agreed with the champion and committee. Operation of the plant-side hardware stays with KAILEdge and the host site under the host-site agreement. The grant does not fund ongoing operation after T4.

---

## Co-Marketing

Upon release, KAILEdge would collaborate with the Foundation on an announcement, a technical write-up of the reference case, and ecosystem promotion. Any public mention of Sustainable Impacts depends on its agreement.

---

## Motivation

Canton's RWA direction needs ways to bring evidence about physical assets into Daml contracts. Tokens that represent carbon credits or industrial production commonly depend on data supplied by a reporter, which attests to a value rather than to the computation that produced it. We are not aware of an open reference implementation on Canton that checks a device-sealed, replayable measurement on ledger.

Who benefits:
- Registries, verifiers and issuers get a replayable measurement record they can reference.
- Buyers get evidence they can check without trusting a single reporter.
- CBG producers get a route to supply continuous evidence rather than periodic batch evidence.
- Canton developers get open templates, a certificate schema, conformance tests and a replay guide for later environmental assets.

Value to the Canton ecosystem:
1. A reference integration from device-sealed environmental measurements to Daml contracts, tested on testnet.
2. A second vertical for the same measurement architecture (designed for cold chain, not yet built there).
3. Reusable open-source templates, schema, conformance tests and replay guide.
4. A route for CBG producers to supply verifiable evidence to registries, verifiers and buyers who use Canton.
5. Any resulting Canton activity would generate network fees. No volume is assumed.

**Public good.** The integration layer is Apache 2.0 and is designed to work for any issuer or registry. The proprietary part is limited to KAILEdge's calibrated physics parameters. A verifier can check signature, integrity and chain without KAILEdge.

**Honest position on Canton adoption.** No external Canton application currently consumes KAILEdge certificates. The pilot would create a reference integration and a reusable schema, Daml templates and a documented replay pathway. We are not claiming existing Canton adoption. We are in discussions with Sustainable Impacts about hosting the pilot. No agreement is signed.

---

## Market context

The Union Cabinet approved the GOBARdhan scheme for compressed biogas on 6 August 2026, with an outlay of Rs 23,731 crore for FY 2026-27 to FY 2035-36. The Government states the scheme aims to increase domestic CBG production nearly ten-fold (PIB, https://www.pib.gov.in/PressReleasePage.aspx?PRID=2295480). Business Standard reports the target as about 5 million standard cubic metres per day (https://www.business-standard.com/industry/news/ril-plans-1-trn-investment-to-set-up-cbg-projects-in-andhra-pradesh-126100200970_1.html).

On 2 October 2026, Anant Ambani, Executive Director of Reliance Industries, said Reliance plans to invest Rs 1 trillion in compressed biogas plants in Andhra Pradesh (Business Standard, same link; Moneycontrol, https://www.moneycontrol.com/news/india/anant-ambani-announces-rs-1-lakh-crore-reliance-investment-in-andhra-pradesh-backs-tech-led-farming-14043461.html).

These are public statements about the CBG market. They do not indicate any relationship with, or interest in, KAILEdge or this pilot.

---

## Potential credit buyers and marketplaces

KAILEdge does not issue credits. No party below has an agreement, partnership or stated interest in this pilot. These are marketplaces and platforms that a registry or issuer could use for credits backed by measured data from the pilot. Each statement is as published by that party. Whether any of them accepts credits from Indian CBG plants depends on registry and methodology, and has not been checked.

| Platform | What its own source says | Canton link | Source |
| --- | --- | --- | --- |
| Xpansiv | Announced on 8 Oct 2025 a phased initiative to enable tokenization of environmental assets and their performance data on Canton Network. It begins with a pilot program on asset identifiers. | Announced, pilot stage | https://www.xpansiv.com/xpansiv-to-enable-tokenized-environmental-asset-infrastructure-via-canton-network/ |
| ClimateTrade | A marketplace where companies and individuals buy carbon, plastic and biodiversity credits and EACs directly from project developers. Announced on LinkedIn on 12 Nov 2025 that it joined Canton Network as a network validator. | Validator, announced by ClimateTrade | https://www.climatetrade.com/en/about-us/ and https://www.linkedin.com/posts/climatetrade_activity-7394333673728221184-Korb |
| Carbonplace | Founded by nine global banks. A platform for carbon credit management and trading, with access to 14 registries through one account. | None found on its site | https://carbonplace.com/ |
| Toucan | Tokenizes carbon credits (TCO2 tokens and carbon pools). Says it has brought $100 million in carbon credits onchain. Offers a bridge for Puro.earth removal credits. | None found in its docs | https://docs.toucan.earth/ |

"None found" means not found in the sources checked, not that none exists.

---

## Rationale

**Why this approach.** A sealed, replayable record separates what was measured from who reported it. Hardware sealing at the source, with replay from recorded inputs, lets a third party check the result without trusting the reporter.

**Alternatives.** Oracle-supplied values (simple, but attest to a number, not its computation). Periodic third-party measurement (existing practice, retrospective). KAILEdge does not replace either. It sits beneath registries, verifiers and issuers.

**Fit with existing tooling.** The Daml layer is new and does not duplicate existing token standards. It intends to use CIP-0056 interfaces for transfer and retirement rather than define its own.

---

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Host-site agreement not signed | T1 does not start until it is signed |
| Sensor calibration delays | An NABL-accredited laboratory will be engaged during procurement |
| Canton testnet integration complexity | Daml contracts developed in parallel with hardware deployment |
| Physics engine performance in field conditions | The pilot tests the architecture before any scale commitment. Results are reported against the targets, including misses |
| Regulatory compliance | A hazardous-area zoning assessment will be conducted before installation |
| Offline operation | Certificates queued locally. Backup power design to be confirmed |
| Methodology and registry acceptance | Not assumed. Registry, verifier and methodology are confirmed with the project, not by this grant |

---

## Contact

Prasad Gopal, Founder, KAILEdge, prasad@kailedge.com, www.kailedge.com
