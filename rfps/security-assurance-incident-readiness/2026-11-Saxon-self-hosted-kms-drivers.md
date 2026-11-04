# Self-Hosted KMS Drivers for Canton Validators: Maintenance and PKCS#11

## Development Fund Proposal

**Organization:** Saxon  
**Author / Primary Contact:** Ian Lawrence  
**Status:** Submitted  
**Created:** 2026-11-02  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Primary: [RFP 26: Key Management and Signing Controls](../../2026-2028-strategic-roadmap.md) (key custody, hardware security modules). Secondary: [RFP 7: Expanded Network Access and Validator Onboarding](../../2026-2028-strategic-roadmap.md) (security and availability enhancements)  
**Champion:** `Needs Champion`  
**Total Funding Request:** 1,000,000 CC  
**Project Duration:** 12 months  
**Label:** `node-deployment-operations`  
**Category:** Security, Assurance & Incident Readiness

---

## Abstract

The validator security guide recommends keeping participant keys in an external KMS, but the only supported options are Google Cloud KMS and AWS KMS. Operators who self-host, run on another cloud, or are required to use their own HSM have no maintained path. Saxon has released two open-source (Apache-2.0) Canton KMS drivers that close part of this gap: one for OpenBao / HashiCorp Vault Transit and one for Scaleway Key Manager. This proposal funds a year of maintenance of both drivers across Canton and Splice releases, a new PKCS#11 driver for hardware HSMs, and the testing and documentation needed for other operators to adopt them. It is structured as a renewable annual grant.

---

## Specification

### 1. Objective

Make externally held participant keys a supported option for validator operators outside AWS and GCP. Concretely:

- Keep both drivers working on every Canton version that Splice ships, tested in CI against Digital Asset's `kms-driver-testing` suite.
- Deliver a PKCS#11 driver so a validator can keep its keys in a hardware HSM.
- Close the gaps that currently stop an operator from relying on the drivers in production: HashiCorp Vault (not only OpenBao), Vault namespaces, HA failover, and behaviour under sustained load.
- Get the drivers used by validator operators other than Saxon, and report on it publicly.

### Current State

| | OpenBao / Vault Transit | Scaleway Key Manager |
|---|---|---|
| Repository | github.com/saxon-xyz/canton-kms-driver-openbao | github.com/saxon-xyz/canton-kms-driver-scaleway |
| Release | v0.1.0 | v0.2.0 |
| Keys | Ed25519, ECDSA P-256/P-384, RSA-2048 OAEP, AES-256-GCM | ECDSA P-256/P-384, RSA-2048 OAEP, AES-256-GCM |
| DA `kms-driver-testing` (Canton 3.6.4) | passes, run in CI against an OpenBao container | passes against the real Scaleway API (not in CI: needs credentials) |
| Canton end-to-end | participant + BFT synchronizer, TLS with a private CA | participant + BFT synchronizer |
| Splice | loads in the `canton-participant` image for Splice 0.9.4 and 0.10.0 (Canton 3.7.1) via `EXTRA_CLASSPATH`; no custom image | same |
| Live DevNet validator (Splice 0.9.4 Helm charts) | 2026-11-03, OpenBao 2.7.2 over TLS with a private CA: keys created in Transit, onboarded, pings, token rotated without a restart, fails closed while sealed and recovers on unseal without a restart | 2026-11-03: keys created in Key Manager, onboarded, pings, restarts, fails closed on a bad credential |

With session signing keys enabled, ping latency through the Scaleway driver was the same as with software keys (local test, median about 0.85 s for both). A documentation PR adding driver-based KMS to the validator security page is open: canton-network/cf-docs#2003.

The DevNet install found a problem that the earlier tests could not: the `splice-participant` chart mounts only `secret` and `persistentVolumeClaim` volumes, so a driver JAR shipped as a ConfigMap (as both READMEs and the docs PR first said) is silently replaced by an empty directory and the participant cannot find the driver. The docs PR and both READMEs now ship the JAR as a secret. The same install showed that a participant whose KMS credentials are rejected stops before it initialises but its pod can still report ready, so operators need to monitor the participant's `crypto` health state. The OpenBao install showed the same when OpenBao was sealed, and that the participant recovers on its own once the KMS is back.

Not yet tested: HashiCorp Vault itself, Vault/OpenBao namespaces, HA standby failover, sustained load, behaviour when the KMS is down for long (Canton retries signatures about 250 times a minute while OpenBao is sealed). Neither driver is used in production yet. Saxon intends to run its next MainNet validator on the Scaleway driver from its first start (a KMS participant has to start fresh).

### 2. Implementation Mechanics

**Release compatibility.** Each Canton minor release can change the library versions a driver must be built against. For each Splice release that changes the Canton version, we run the DA test suite for each driver, load it in the released `canton-participant` image, and publish a compatible release if one is needed. CI runs the suite on every change: against an OpenBao container for the OpenBao driver, against SoftHSM2 for the PKCS#11 driver, and against a dedicated Scaleway test project for the Scaleway driver.

**PKCS#11 driver.** A driver that uses a PKCS#11 token for all key operations. Keys are generated on the token and marked non-extractable. It targets the same key types as the existing drivers where the token supports them (Ed25519 requires PKCS#11 3.0 `CKM_EDDSA`). It is tested in CI against SoftHSM2 and before release against a hardware HSM (YubiHSM 2).

**Production gaps.** Test the OpenBao driver against HashiCorp Vault, with namespaces, and across an HA standby failover; run a sustained-load test of each driver with session signing keys enabled and publish the results. Fix what these turn up.

**Support and reporting.** Issues are triaged in the public repositories. A short public report each quarter covers releases shipped, Canton versions supported, issues opened and closed, and known adopters.

**Team.** Ian Lawrence (Saxon Principal), about 0.2 FTE across the year, more during the PKCS#11 build. Awen (Saxon DevOps), about 0.1 FTE.

### 3. Architectural Alignment

- Uses the Canton KMS Driver API as published (`com.daml:kms-driver-api` on Maven Central) and the Splice participant chart's existing `kms`, `additionalEnvVars` and volume settings. No changes to Canton, Splice or Daml.
- Primary fit is RFP 26 (Key Management and Signing Controls): the work is key custody and HSM support for participant keys, in the self-operated and hosted environments that RFP names. It also meets RFP 7's "security and availability enhancements" for validator onboarding, because an operator outside AWS and GCP can then follow the security guide's KMS recommendation. It does not cover RFP 26's ClearSigning or multi-party approval items.
- Supports the roadmap's goals of operators running independently and keys under the key holder's control.
- Complements Digital Asset's scalability grant (Milestone 6, KMS cost), which reduces the number of KMS signing operations. Session signing keys benefit these drivers in the same way.

### 4. Backward Compatibility

*No backward compatibility impact.* The drivers are opt-in and loaded through `EXTRA_CLASSPATH`. Canton does not support moving an existing participant onto KMS, so adopting a driver means starting a new participant; nothing changes for participants that keep software keys.

---

## Milestones and Deliverables

### Milestone 1: Compatibility and production testing
- **Committed Date:** 3 months after approval
- **Focus:** Both existing drivers on the current Splice release, and the open production gaps.
- **Deliverables / Value Metrics:** Both drivers released and tested for the Canton version of the current Splice release; CI runs the DA suite for each driver. OpenBao driver tested against HashiCorp Vault, namespaces and HA standby failover, with fixes released. Sustained-load results published. First quarterly report.

### Milestone 2: PKCS#11 driver
- **Committed Date:** 6 months after approval
- **Focus:** Hardware HSM support.
- **Deliverables / Value Metrics:** PKCS#11 driver v1.0 released under Apache-2.0: passes the DA suite against SoftHSM2 in CI and against a YubiHSM 2; Canton end-to-end and Splice participant deployment documented.

### Milestone 3: Adoption
- **Committed Date:** 9 months after approval
- **Focus:** Use by operators other than Saxon.
- **Deliverables / Value Metrics:** 2 validator operators other than Saxon run one of the drivers on DevNet, TestNet or MainNet, confirmed by the operator. Compatible releases for each Splice release in the period. Second and third quarterly reports.

### Milestone 4: Year One close and renewal
- **Committed Date:** 12 months after approval
- **Focus:** Maintenance and the renewal decision.
- **Deliverables / Value Metrics:** Compatible releases for each Splice release in the period. Fourth quarterly report. Year One review and Year Two renewal proposal (maintenance only, sized on Year One data) submitted in Month 10.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Adoption: the operator count in Milestone 3 is backed by a statement from each operator (they may ask not to be named publicly).
- Operators are never left without a supported driver: for each Splice release that changes the Canton version, a driver release that passes the DA suite on that version is available within 14 days of the Splice release, or the existing release is confirmed compatible.
- A participant using the PKCS#11 driver with a hardware HSM connects to a synchronizer and completes a ping.
- Test reports (Vault, HA failover, sustained load, HSM) are published in the repositories with the configuration needed to reproduce them.
- Quarterly reports are published on time.

---

## Funding

**Total Funding Request:** 1,000,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Compatibility and production testing): 200,000 CC upon committee acceptance
- Milestone 2 (PKCS#11 driver): 400,000 CC upon committee acceptance
- Milestone 3 (Adoption): 200,000 CC upon committee acceptance
- Milestone 4 (Year One close and renewal): 200,000 CC upon final release and acceptance

About 60% (Milestone 2 and part of Milestone 1) is one-time work: the PKCS#11 driver, the Vault/HA/load testing and HSM hardware. The rest is recurring maintenance. Renewal years drop to maintenance only, with the amount set in the Month 10 renewal proposal from Year One data.

### Volatility Stipulation
The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon release, Saxon will collaborate with the Foundation on:

- Announcement coordination for the PKCS#11 driver release
- A technical blog post on running a Splice validator with self-hosted KMS keys, including the DevNet findings above
- Keeping the validator security documentation in cf-docs current as the drivers change

---

## Motivation

The Foundation tells operators to keep their keys in a KMS or HSM so they cannot be extracted, but today that advice can only be followed on AWS or GCP. Operators on other clouds, on their own hardware, or under rules that require an HSM they control have to choose between software keys and writing and maintaining a driver themselves. A driver also has to be rebuilt and retested whenever Canton changes its library versions, which is a recurring cost no single operator wants to carry alone. Funding that maintenance once, in public, lets every such operator follow the security guide.

---

## Rationale

Canton already defines a KMS Driver API for this purpose, so the proposal extends what exists rather than changing Canton or Splice. The three drivers cover the main self-hosted options: OpenBao/Vault Transit (a widely used self-hosted secrets manager), a cloud KMS outside AWS and GCP (Scaleway, which Saxon's validators run on), and PKCS#11 (the standard interface to hardware HSMs, so one driver covers most vendors). Alternatives considered:

- Vendor-specific HSM drivers: PKCS#11 covers them with one codebase.
- Each operator writing their own: duplicates the work and leaves drivers untested against new Canton versions.

---

## Out of Scope

- Changes to Canton, Splice or the KMS Driver API.
- Migrating an existing participant onto KMS (not supported by Canton).
- Drivers for AWS or GCP (Canton already has them).
- Operating KMS or HSM infrastructure for other operators.

---

## Sustainability

Saxon runs Canton validator infrastructure and has its own reasons to keep these drivers working: KMS-backed keys for the validators it stands up. Maintenance after Year One continues under the renewal structure above. If the grant is not renewed, Saxon will keep maintaining the drivers it uses, at a pace set by its own needs. Everything is Apache-2.0, with CI and test setups in the repositories, so another maintainer can take any driver over.

---

## Why Saxon

Saxon operates Canton validator nodes on MainNet, TestNet and DevNet, and wrote both existing drivers. We built the Scaleway driver because our validators run on Scaleway and need KMS-backed keys outside AWS and GCP. While building them we found and fixed the issues an operator hits in practice: the API coordinates moving to Maven Central, a fat JAR breaking Canton's logging, library pins per Canton release, HOCON quoting in the Splice chart, the chart dropping ConfigMap volumes, and session signing keys for latency.
