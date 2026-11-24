## Development Fund Proposal: Rütli, open-source threshold key management for Canton node keys

| Field | Value |
| --- | --- |
| Organization | StakeCraft LLC |
| Author / Primary Contact | Vasily Istomin (business@stakecraft.com); technical lead Alex Novacovschi, CTO |
| Status | Submitted |
| Created | 2026-11-19 |
| Proposal Type | RFP-aligned proposal |
| RFP / Roadmap Area | Security, Assurance & Incident Readiness: RFP 26, Key Management and Signing Controls (also RFP 23, Validator and Shared Infrastructure Security and Resilience) |
| Champion | Jonathan Mayeur, IntellectEU |
| Total Funding Request | Up to 3,742,500 CC (≈ $307,000 at $0.082/CC): 2,889,500 CC of work, of which 936,000 CC is paid only for independent adoption, and up to 853,000 CC of external audit fees paid at cost |
| Project Duration | ≈ 34 weeks to v1.0 (Milestones 1–2); adoption window of 12 months (Milestone 3); 12 months of maintenance after 1.0 (Milestone 4) |
| Label | node-deployment-operations |
| Repository | https://github.com/Stakecraft/rutli (Apache-2.0) |

---

## Abstract

A Canton’s node namespace key is its identity and authorizes any change in its topology. The key can’t be rotated. By default, on any Canton Validator/Splice, this key, signing keys and the encryption key are stored unencrypted in the participant database and in every backup of it.

Rütli is a threshold key management system(KMS) for all canton/splice validator node. It's open-source and self hosted. The cluster connects directly to regular canton node through the KMS Driver SPI. Rütli cluster holds three types of keys: Ed25519 namespace keys FROST shares (2-of-3), signing keys as FROST shares (2-of-3) and the encryption key (ECIES P-256) sealed and replicated, so the participant holds no private keys. No machine in the cluster ever holds a whole namespace or signing key, and signing never puts one together.

Rütli runs today. A Splice DevNet validator has been on it since 2026-10-07, and we have rehearsed
the migration of an exsiting validator three times, twice onto a new participant and once in place,
without changing its namespace or party IDs. We ask the Fund for the path to a production 1.0: an
external security audit with a public report, a TestNet run and the 1.0 release, adoption by
independent operators, and a year of maintenance.

To see how the cluster signs and what happens when cosigners fail or are breached:
https://stakecraft.github.io/rutli/explorer/

---

## Specification

### 1. Objective

Give every Canton validator, Super Validator and institutional participant an open-source,
self-hosted way to keep node keys under threshold control, with signing policies, rotation and
recovery. Today the options are plaintext keys in Postgres, a cloud KMS where one provider holds
the key, or proprietary products.

### 2. Implementation Mechanics

Rütli has two parts.

The driver is a JVM jar that the participan loads through `crypto.kms.type = driver`. It sends each
private-key operation to the cosigner cluster over mutual TLS and fails over between cosigners.
Canton and Splice are not modified.

The cosigners are Rust daemons, one per node. The namespace and signing keys are FROST-ed25519
shares. A signature needs `t` of `n` cosigners (2 of 3 by default) and comes out as an ordinary
Ed25519 signature. A key created in the cluster is born by distributed key generation. Shares are
sealed at rest with per-node keys. Today the encryption key (ECIES P-256) is held whole, sealed and
replicated on every cosigner. In 1.0 it becomes threshold-shared as well (Milestone 2).

Each key can require M-of-N human approvers, who sign with their own Ed25519 keys, and has rate
limits, a signing journal and a hash-chained audit log. The driver signs every request and the
cosigners check that signature. Once they are set to refuse unsigned requests (`require_intent`,
switched on by the operator in v0.4.0 and the default from v0.5.0), one compromised cosigner cannot
get the others to sign for it.

An existing validator can move in. Its namespace key is exported once, split offline into shares
and checked against the Canton fingerprint. The namespace and party IDs stay the same. We have two
runbooks, one onto a new participant and one in place.

If fewer than `t` cosigners are reachable, signing stops and nothing is lost. The key is lost only
if more than `n − t` shares are gone and there are no backups, so going live requires sealed backups
and a rehearsed restore (`docs/disaster-recovery.md`). On DevNet a 2-of-3 signature across three
data centers takes about 100 ms.

**What exists today.** All of it is public and Apache-2.0. StakeCraft paid for it, and none of it is
part of this request.

- v0.4.0, released 2026-11-14, the thirteenth release since July. The driver passes Canton's
  `KmsDriverTest` conformance suite against Canton 3.6.1 in CI and runs on Canton 3.7.2.
- A Splice DevNet validator on Rütli since 2026-10-07, now on Splice 0.10.1, with a public soak log
  (`docs/soak-2026-10-devnet.md`).
- Migration rehearsed three times on DevNet: twice onto a new participant (2026-10-09 and
  2026-10-14) and once in place (finished 2026-11-12).
- Helm chart, Kubernetes and Compose deployments, Prometheus metrics and alerts, a Grafana
  dashboard, and runbooks for the key ceremony, disaster recovery and migration.
- Two internal security reviews. The October findings are public
  (`docs/security/internal-review-2026-10.md`), and every critical and high one was fixed before
  v0.4.0; one of those fixes takes effect once the operator switches on `require_intent` (see Known
  limitations). The hardening from the November review ships in v0.5.0.

Before the audit we will also release v0.5.0 (code freeze planned for mid-December 2026) and
rehearse the migration of a validator together with its wallet users. Neither is part of this
request.

### 3. Architectural Alignment

Rütli uses only Canton's public KMS Driver SPI and works with the standard Splice validator and
participant charts: the driver goes on `EXTRA_CLASSPATH` and its configuration into
`ADDITIONAL_CONFIG_*`. CI runs the conformance suite against Canton 3.6.1. Our DevNet validators
moved to Canton 3.7.2 (Splice 0.10.1) on 2026-11-15 with the same driver.

Coverage of RFP 26:

| RFP 26 item | Rütli |
| --- | --- |
| Key custody | `t`-of-`n` FROST shares; signing never assembles the whole key |
| Signing policies | Per-key approval rules and rate limits; signed requests checked by each cosigner |
| Segregation of duties | Distinct roles in the cluster PKI (signer, operator, cosigner); approvers hold their own keys; witnessed key ceremonies |
| Key rotation | Share refresh without changing the key; signing and encryption keys rotate through the driver |
| Recovery | Sealed-share backup and restore, disaster-recovery runbook. Emergency recovery for the loss of every cosigner comes in 1.0 |
| Hardware security modules | Experimental PKCS#11 backend for non-Ed25519 keys, outside the audit. Confidential computing is planned for 2.0 |
| Multi-party approval | M-of-N approvers before any signature with a protected key |
| Clear signing | Not covered. The SPI gives the driver a 34-byte digest, not the transaction. Wallet-side work (#617, #82) covers this |
| Hosted and self-operated environments | Self-hosted: Helm, Kubernetes, Compose. Cosigners can sit in separate locations or with separate operators |

RFP 23 asks for controls that work for self-operated and hosted validators. Backup and recovery are
covered as above. For a hosted validator, the cosigners can be placed with the client or a third
party: the provider then runs the client's participant without holding its keys, and the client's
approvers gate every use of the namespace key. On resilience, signing on DevNet fails over when a
cosigner restarts. The dedicated outage, refresh and restore drills are part of the TestNet
criteria in Milestone 2.

Related work in the Fund:

- Decentralization Manager (#298) gives m-of-n control at the Daml and topology level. Rütli
  protects one node's own keys. The two can be used together.
- Verify-before-sign (#617) and ClearSign (#82) are wallet-side checks for external parties.
- Horcrux-style signers protect a Super Validator's CometBFT key. Rütli covers the participant keys
  they cannot reach.

### 4. Backward Compatibility

No backward compatibility impact. Rütli is opt-in per node, and a node without the driver is
unaffected.

---

## Milestones and Deliverables

### Milestone 1: External security audit of v0.5.0

- **Committed Date:** 12 weeks after grant approval.
- **Focus:** an independent audit with a public report.
- **Deliverables / Value Metrics:**
  - Cure53 audits Rütli v0.5.0. We chose Cure53; the Committee may ask for another firm. v0.4.0 is
    the current release and the auditors' pre-read. v0.5.0 adds the hardening from our internal
    pre-audit review. The audit starts after the v0.5.0 freeze and after grant approval, and we
    expect about 3–4 weeks; Cure53 proposes the length.
  - Scope, from `docs/audit-rfq.md`: the FROST cosigner cluster (key generation, signing, refresh,
    the share-repair primitive, nonce handling), the cluster-hosted encryption key, the driver, and
    the split ceremony used for migration. The HSM backend is out of scope.
  - Fixes for every finding, released as v0.5.x, and a retest by the auditor.
  - The final report, published in the repository with our response to each finding.
- **Acceptance:** the report and the retest letter are public; no Critical or High finding is open
  after the retest; every Medium is fixed or recorded as an accepted residual with a rationale the
  Security Subcommittee accepts; a tagged release contains every fix.

### Milestone 2: TestNet run and Rütli 1.0

- **Committed Date:** about 34 weeks after grant approval.
- **Focus:** four clean weeks on TestNet and a 1.0 that operators can install from the docs.
- **Deliverables / Value Metrics:**
  - A Splice TestNet validator on the audited release for at least four consecutive weeks, with the
    namespace, signing and encryption keys in the cluster. The public soak log shows no signing
    errors caused by the KMS, p99 signing latency under 1 s, a live share refresh, a cosigner outage
    with no signing gap, and a backup, wipe and restore drill. A TestNet validator we start earlier
    does not count toward the four weeks.
  - Published benchmarks: signing latency with all cosigners up and with one down, and the
    sustained signing rate.
  - The 1.0 features: threshold ECIES, so that the encryption key is held as shares like the other
    two; a runbook for encryption-key rotation and a driver that serves the old and the new key
    side by side during it, which is how existing nodes move to the threshold key; a signed audit
    log exported off the host; emergency recovery for the loss of every cosigner; the driver
    published to a Maven repository.
  - A second Cure53 review of those features, with a public report and a retest.
  - Rütli 1.0: tagged release, image digests, driver jar, Helm chart, upgrade notes from 0.5.x, and
    operator documentation.
  - A reference architecture for RFP 26: how a self-operated validator, a node-as-a-service
    provider and an institution deploy Rütli. It covers choosing `t` and `n`, placing cosigners in
    separate trust domains, keeping the namespace root in a separate cold cluster through namespace
    delegation, roles and approvers, and the evidence an auditor can ask for.
  - StakeCraft's own MainNet validator on Rütli 1.0 for at least 30 consecutive days.
- **Acceptance:** the TestNet run meets every criterion above, shown by the soak log and metrics
  snapshots; the second Cure53 report and retest are public with no Critical or High finding open;
  1.0 is tagged with the features listed above, holds the encryption key as shares, and is
  installable from the published chart and images by following the docs; the benchmarks are
  published; the reference architecture is published and reviewed by at least one member of the
  Security SIG;
  StakeCraft's MainNet validator has run on 1.0 for 30 days, and we give the Committee its
  participant ID.

### Milestone 3: Independent operators in production

- **Committed Date:** within 12 months of grant approval.
- **Focus:** adoption outside StakeCraft.
- **Deliverables / Value Metrics:**
  - Validator or Super Validator operators independent of StakeCraft run a participant whose keys
    are in Rütli on MainNet (or on TestNet, for a Super Validator in pre-production) for at least
    30 consecutive days. The node can be new on Rütli or migrated into it.
  - We support each onboarding: ceremony, migration, monitoring. The per-operator payment covers
    that work.
- **Acceptance:** for each adopter, a written confirmation from the operator, a contact for the
  Committee, and the participant ID or namespace fingerprint, shared privately if the operator
  prefers. StakeCraft, its affiliates and validators that StakeCraft operates for its clients do
  not count. A demo or proof of concept does not count.

### Milestone 4: 12 months of maintenance after 1.0

- **Committed Date:** 12 months from Milestone 2 acceptance.
- **Focus:** maintenance at 0.25 FTE (480 engineering hours).
- **Deliverables / Value Metrics:**
  - Security patches: critical within 7 days of disclosure, high within 30 days.
  - A compatible release within 4 weeks of each Canton minor release and of each Splice release
    that changes the driver's environment.
  - Issue triage and support for adopters.
  - A public report each quarter: releases, supported versions, issues opened and closed, known
    adopters.
- **Acceptance:** each quarterly report is published and shows the terms above were met.

---

## Acceptance Criteria

Each milestone lists its own criteria. In short: a public external audit with no open Critical or
High finding; four clean weeks on TestNet and a 1.0 that operators install from the docs;
independent operators running Rütli in production; a year of maintenance against published terms.

---

## Funding

**Total Funding Request:** up to **3,742,500 CC** (≈ $307,000).

CC amounts use the price on the day of submission: $0.082 per CC (CoinGecko, 2026-11-19).
Engineering is priced at $150/hour ($1,200 per engineer-day). Audit fees are passed through at
cost.

### Payment Breakdown by Milestone

| Milestone | Our work | Audit fee, at cost | Milestone total |
| --- | --- | --- | --- |
| 1. Audit | 219,500 CC | Up to 609,500 CC (cap $50,000) | Up to 829,000 CC |
| 2. TestNet and 1.0 | 856,000 CC | Up to 243,500 CC (cap $20,000) | Up to 1,099,500 CC |
| 3. Adoption | 234,000 CC per independent operator, up to 4 | none | Up to 936,000 CC |
| 4. Maintenance | 878,000 CC, paid quarterly (219,500 CC) | none | 878,000 CC |
| **Total** | **Up to 2,889,500 CC** | **Up to 853,000 CC** | **Up to 3,742,500 CC** |

Our work is 15 engineer-days in Milestone 1 (support for the auditors, fixes, the retest) and 56 in
Milestone 2: 30 for TestNet operations, the release, documentation and the reference architecture,
and 26 for the 1.0 features, plus ≈ $3,000 of infrastructure. Threshold ECIES is not in those 26
days: we build it at our own cost. Milestone 4 is 480 hours over 12 months. Each adopter in
Milestone 3 is paid on acceptance.

The audit fee is Cure53's invoice. It is paid with its milestone, on acceptance, at cost and up to
the cap. The caps are set in USD, and the CC figures show them at today's price. The phase 1 cap is
the auditor's written estimate plus a margin for the v0.5.0 scope. The phase 2 cap is our own
estimate until the auditor quotes it, and phase 2 also covers threshold ECIES. If phase 1 comes in
under its cap, we ask to carry the unused part over to phase 2; the two caps together do not grow.

Adoption is 32% of our work: with no adopters the Fund pays at most 2,806,500 CC, of which up to
853,000 CC goes to the auditor. If the Committee prefers to run the audits through the Foundation's
security review program (#410), the request falls to 2,889,500 CC.

### Volatility Stipulation

The project runs longer than 6 months. The grant is denominated in fixed Canton Coin and will
require a re-evaluation at the 6-month mark. The audit fees are the one exception: they are a third
party's invoices, paid at cost and converted at the CC price on the day of payment, up to the USD
caps above.

---

## Co-Marketing

We will coordinate the 1.0 release and the audit reports with the Foundation, and present Rütli to
the Node Deployment & Operations and Security SIGs.

---

## Motivation

A namespace key can't be rotated. If the key leaks, the attacker takes control of the node.
If the key is lost - it means that parties and balances under it are lost too. By default, a Splice validator's key is kept unencrypted in Postgres: on one of our own DevNet validators, eight plaintext database dumps each contained it.

Each validator, including SV's, has these keys. This means that every operator is a potential user of Rütli.
The operators who stand to gain the most are those who can’t or don’t want to entrust their key to a cloud provider. For example, institutions under cloud-concentration rules such as DORA. On CometBFT networks threshold signers such as Horcrux became standard validator infrastructure. Canton has no open-source equivalent.

The demand: we met an operator at a conference and he asked whether an existing node can move in without changing its identity, which is why the migration path exists. StakeCraft is a Canton NaaS provider and can offer Rütli to the validators we operate. Those validators do not count toward Milestone 3.

After Milestone 4 is completed, we intend to keep maintaining Rütli, because our own validators will run on it. If we ever stop, the code stays public under Apache-2.0, and we will give 90 days' notice and offer the repository to the Foundation or an agreed successor.

---

## Rationale

We use threshold signing and not an HSM because HSM support for Ed25519 is uneven and one HSM is
one point of loss. With FROST, `n − t` nodes can fail and fewer than `t` learn nothing.

We build on the KMS Driver SPI because it is Canton's supported extension point. Digital Asset has
nothing extra to maintain and operators have no fork to track.

The audit comes first because the core is built. What is missing is independent assurance.

How Rütli compares with the alternatives:

| Option | Where the whole key is | Open source | Self-hosted | Existing node keeps its namespace |
| --- | --- | --- | --- | --- |
| Default (participant database) | In the database and its backups | n/a | Yes | n/a |
| Cloud KMS (AWS, GCP) | Inside the provider | No | No | No, the Splice docs ask for a fresh validator |
| Launchnodes KMS driver | In one cloud KMS (Azure, Google) | Not stated; commercial licence for MainNet | No | Not stated |
| Blockdaemon Builder Vault | External-keys mode: nowhere (MPC, including the encryption key). Enveloping mode: in the node's memory | No | Yes | External-keys mode: no, new participant. Enveloping mode: yes, with the key whole in memory |
| MPCH Stronghold-KMS | Not public | No public code found | Not public | Not public |
| Saxon drivers (#950) | In one KMS or HSM | Yes | With OpenBao or PKCS#11 (planned) | No, new participant |
| **Rütli** | Nowhere for the signing keys. The encryption key is sealed whole on each cosigner until 1.0 makes it threshold too | Yes, Apache-2.0 | Yes | Yes, rehearsed on DevNet |

The table reflects public documentation as of November 2026, and we welcome corrections. Sources:
Canton [KMS docs](https://docs.digitalasset.com/operate/3.5/howtos/secure/kms/mode/external_key_storage.html),
Splice [validator security](https://docs.canton.network/global-synchronizer/production-operations/validator-security),
Blockdaemon [Builder Vault Canton KMS](https://builder-vault-tsm.docs.blockdaemon.com/docs/canton-kms),
the [Launchnodes forum post](https://forum.canton.network/t/launchnodes-kms-driver-for-canton-azure-and-gcp-integration/9110),
and Saxon's proposal (#950). Custody platforms such as Fireblocks, Dfns and BitGo protect the keys of
the parties and assets they custody, not the node's own.

The Saxon proposal is complementary. It serves operators who want the key in one Vault or HSM they
already run; Rütli serves those who want no single machine or administrator to hold it. Our request
is larger because it includes two external audits at cost, the migration and recovery work, and the
adoption milestone.

On price: $150/hour is the blended rate in the approved Daml Code Assistant proposal, maintenance
at 0.25 FTE matches the Decentralization Manager's, and audit fees are shown separately as in the
C# and Rust SDK proposals.

---

## Known limitations

- No external audit yet. That is Milestone 1.
- Until 1.0 the encryption key is not threshold-shared. It is sealed whole on each cosigner.
  Threshold ECIES comes with 1.0 (Milestone 2), and existing nodes move to it by rotating the
  encryption key.
- A migrated key existed whole before the migration, on the old host, in its backups and at the
  offline split. Migration protects the future, not the past. The Splice validator docs do not
  support moving an existing participant onto a KMS for this reason, and in-place migration is not
  a procedure documented by Digital Asset.
- In v0.4.0 the operator switches on some protections, among them refusing unsigned sign requests
  and per-driver access lists. v0.5.0 makes signed requests the default.
- Participants that share one cosigner cluster each need their own key prefix and driver
  certificate. Without them a second participant gets the first one's signing keys. A guard is
  planned for v0.5.0.
- The default Helm deployment runs all cosigners in one Kubernetes cluster, which is one
  administrative trust domain. The reference architecture in Milestone 2 covers separate domains.
- Rebuilding a lost share from the surviving cosigners exists as a tested primitive, not yet as an
  operator procedure. Until then recovery relies on backups.

---

## Team

StakeCraft has run validators since 2018 on networks including Solana, Monad, Polygon and NEAR. On
Canton we run validators on DevNet, TestNet and MainNet and offer node-as-a-service. Rütli is built
and maintained by our engineering team, led by Alex Novacovschi (CTO). Contact: Vasily Istomin,
business@stakecraft.com.
