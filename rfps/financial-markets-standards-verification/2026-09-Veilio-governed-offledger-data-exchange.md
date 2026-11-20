# Governed Off-Ledger Data Exchange: Open Reference Stack for Canton


| Field                  | Value                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Author                 | Quentin CLEMENT (CEO)                                                                                                                                       |
| Org                    | Veilio                                                                                                                                                      |
| Implementation partner | Avicenne Studio (Canton validator : DevNet / TestNet / MainNet)                                                                                             |
| Status                 | Submitted                                                                                                                                 |
| Created                | 2026-08-12                                                                                                                                                  |
| Updated                | 2026-09-21                                                                                                                                                  |
| Proposal type          | **RFP-aligned** (not individual initiative)                                                                                                                 |
| Primary RFP            | **#12.1** Identity, Credentials and KYC Standards for RWA Workflows                                                                                         |
| Secondary RFPs         | **#12.2** Institutional RWA Workflow Standards · **#27** Security Monitoring, Auditability and Evidence                                                     |
| Roadmap area           | [Financial Markets, Standards & Verification](https://github.com/canton-foundation/canton-dev-fund/tree/main/rfps/financial-markets-standards-verification) |
| Target PR path         | `rfps/financial-markets-standards-verification/`                                                                                                            |
| Champion (proposed)    | Charles Desmonty / Kaiko ([SIG Directory](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md))                                 |
| Primary SIGs           | Financial Workflows & Composability · Regulatory Compliance · Token Standards / Asset Standards                                                             |
| Secondary SIGs         | Security · Identity & Metadata · dApp Integration                                                                                                           |
| Contact                | [quentin@veilio.xyz](mailto:quentin@veilio.xyz)                                                                                                             |


---



## Abstract

**RFP alignment:** This proposal responds to **[RFP #12.1 — Identity, Credentials and KYC Standards for RWA Workflows](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)** under *Financial Markets, Standards & Verification* in the [2026–2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md). Secondary alignment: **RFP #12.2** (Institutional RWA Workflow Standards) and **RFP #27** (Security Monitoring, Auditability and Evidence).

RWA and institutional workflows need provider-neutral standards to **issue, verify, reuse, update, and revoke** credentials and evidence packages (KYC/KYB, eligibility, regulatory status) across Canton apps — **without repeating verification**, **without putting PII on-ledger**, and **without making one party's IAM the sole source of truth**. Access Passport is that open governance layer.

**Central thesis:** Canton does not replace IAM. It replaces **unilateral authorization truth** with **multiparty, privacy-preserving shared governance**.

IAM and API gateways excel at access control **inside one organisation's trust boundary**. Even with signed audit logs, when Bank A grants Bank B access to a KYC package or credential evidence set, **Bank A's IAM remains the sole source of truth** on who may access what, for which purpose, until when, and whether access was revoked. Bank B cannot independently verify that state. A supervisor (CNIL, prudential regulator, auditor) cannot verify it without trusting Bank A's internal systems and log exports.

Canton provides a **shared authoritative state** both parties (and an optional **Observer**) read from the ledger: propose → accept → consent → active → revoke/expire, each transition with a Canton transaction ID. Payloads stay off-ledger in existing S3, databases, vaults, and APIs; a thin **gateway** enforces the Canton passport state against that Web2 infrastructure. Institutions keep their stack; Canton governs **cross-organisational credential/package access rights**, not storage.

The value is strongest when a **third party must verify governance without receiving the underlying personal or institutional data**: regulator, DPO, external auditor. That is the scenario IAM + signed logs cannot solve cleanly — and the scenario RFP #12.1 explicitly calls for.

This proposal funds an **open reference stack** (not Veilio Exchange the product, not a proprietary identity/compliance SaaS):

1. **Hardened Daml Access Passport contracts** with **Owner, Recipient, and Observer** roles (propose → accept → consent → revoke → expire), CI governance tests, and a signed DAR — the reusable standard for governed credential/package access.
2. **Storage-agnostic off-ledger gateway** (store / retrieve / revoke) with **write-ahead multiparty access logs** correlated to Canton transaction IDs.
3. **Integrator TypeScript library** and worked examples (**KYC reuse lead**, trade docs, collateral, **regulator-observer**).
4. **Public DevNet/TestNet deployment**, adoption guide, and templates.

**On-ledger (Canton):** passport metadata, lifecycle state, audit transaction IDs. **No PII.**  
**Off-ledger (adapter):** payload files; optional encryption or tokenization by the implementer.  
**Not funded:** Veilio proprietary tokenization SDK / SaaS. Veilio commits to ship the **first production adapter** after the open interface is published.

A working PoC already exists (Daml frameworks, multi-node lifecycle, dashboard, one-command deployer). SDK/protocol pins and scope baseline are **pre-delivery** (not grant-funded). This grant **hardens, standardizes, and publishes** the stack for ecosystem reuse.

**Delivery + maintenance budget:** **~1,200,000 CC** (1,000,000 development + 200,000 maintenance).  
**Adoption incentive (~50% of total ask):** up to **1,200,000 CC** for verified **external** integrators (Section 9).  
**Total envelope:** **2,400,000 CC** (~USD 240,000 at illustrative ~$0.10/CC).

---



## 1. Objective and scope



### Problem

Today, when Bank A shares a KYC package with Bank B:

```
Bank A IAM / API  →  "Bank B has access"     (Bank A's truth only)
Bank B systems    →  "I believe I have access" (must trust Bank A)

Signed logs? Still exported from Bank A's boundary.
Bank B and supervisors cannot independently verify rights or revocation.
```

With an Access Passport on Canton:

```
Bank A  ←—  Canton Access Passport  —→  Bank B
              ↑
         Observer (CNIL / auditor)

Shared state: who · purpose · until when · revoked?
All parties read the same contract. Observer verifies without the payload.
```

The same engine applies to trade-document packages, collateral files, market-data payloads, breach evidence packs, and audit datasets. In each case Canton replaces **unilateral authorization truth** with **shared, ledger-enforced governance** plus **exportable multiparty evidence**.


| Layer                   | Question                                          | IAM / API + signed logs (today)                      |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| **Governance**          | Who may access, why, until when, provable revoke? | Owner's IAM; counterparty and supervisor trust owner |
| **Authoritative state** | Is there one shared truth both parties read?      | No: unilateral; reconciliation is manual or disputed |
| **Payload**             | Where is the file, how is it protected?           | S3, vault, API: unchanged by this proposal           |
| **Evidence**            | Can a third party verify independently?           | Owner's signed logs only; not multiparty-verifiable  |


Builders still lack:

- reusable Daml contracts for **cross-org access lifecycle** with **Observer** support,
- a **gateway** that enforces Canton passport state against existing Web2 storage (chain abstraction),
- **multiparty compliance logs** correlated to Canton transaction IDs,
- an **integrator layer** so apps do not reinvent propose/accept/consent/revoke.



### Why Canton, not API + IAM + signed audit logs

IAM is excellent **within one organisation** but the gap is **cross-organisational authorization truth**, which we need in these use cases.

#### What IAM already does well

- Role-based access inside Bank A's perimeter.
- API key issuance and revocation for Bank A's services.
- Signed or tamper-evident logs in Bank A's SIEM.

None of that is replaced. Bank A keeps its IAM for internal users and systems.

#### What IAM cannot provide (even with signed logs)

When Bank A shares data with Bank B:

1. **Unilateral source of truth:** Bank A's IAM decides and records what Bank B may access. Bank B has no independent read of that state.
2. **Signed logs stay inside the trust boundary:** Bank A can export signed audit logs, but Bank B and CNIL must still **trust Bank A's export** as complete and unaltered. There is no shared contract both parties signed.
3. **Revocation proof is asymmetric:** Cutting an API key stops calls, but proving *when* access ended, that Bank B was notified, and that no further retrieval occurred requires Bank A's cooperation and log archaeology.
4. **No native Observer:** A regulator cannot query a shared governance state; it receives reports from the data owner.

**Signed audit logs improve integrity of one party's records. They do not create multiparty authoritative state.**

#### What Canton adds: shared governance, not a new IAM

> **Canton doesn't replace IAM. It replaces unilateral authorization truth with multiparty, privacy-preserving shared governance.**


| Dimension                     | IAM / API + signed logs   | Access Passport on Canton                 |
| ----------------------------- | ------------------------- | ----------------------------------------- |
| **Scope**                     | Inside one org's boundary | Cross-org: owner ↔ recipient (+ Observer) |
| **Source of truth**           | Owner's database / IAM    | Shared Daml contract both parties read    |
| **Revocation**                | Owner disables key/rule   | Ledger archives contract; tx ID is proof  |
| **Counterparty verification** | Trust owner's system      | Query same on-ledger passport state       |
| **Supervisor (Observer)**     | Reports from owner        | Reads governance + logs; no payload       |
| **Access history**            | Owner's SIEM export       | Multiparty log + Canton tx correlation    |
| **PII on-ledger**             | N/A (off-system)          | None by design                            |


Both Bank A and Bank B see the **same** passport: purpose, scope, expiry, status (active / revoked). Revocation is visible to both immediately via ledger state, not via an email that Bank B may dispute.

#### Chain abstraction: Canton governs rights, Web2 stores data

Institutions do **not** migrate datasets onto Canton. The integration model is deliberate chain abstraction:

```
┌─────────────────────────────────────────────────────────────┐
│  Existing Web2 (unchanged)                                  │
│  S3 · Postgres · internal vault · document API · Veilio vault│
└───────────────────────────┬─────────────────────────────────┘
                            │ adapter interface
┌───────────────────────────▼─────────────────────────────────┐
│  Off-ledger gateway                                         │
│  Query Canton: is passport active for this caller?          │
│  Write-ahead log → then allow/deny retrieve                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ JSON Ledger API
┌───────────────────────────▼─────────────────────────────────┐
│  Canton (metadata only)                                     │
│  Access Passport: owner · recipient · purpose · expiry · status│
│  Audit records with transaction IDs. No PII.                │
└─────────────────────────────────────────────────────────────┘
```

- **Bank A** keeps IAM for employees and internal apps.
- **Canton** holds the **bilateral (or tripartite) agreement** Bank A and Bank B both rely on.
- **Gateway** is the enforcement bridge: `retrieve()` succeeds only if Canton says the passport is active for the calling party.

Builders adopt Canton for **governance coordination**, not to replace storage or internal IAM. That is why this proposal funds a **DAR + gateway interface + integrator library**, not a new identity product.

#### When the committee should fund this (and when not)

**Fund if:** the workflow crosses organisational boundaries and a counterparty or supervisor must **independently verify** access rights, purpose limitation, or revocation (KYC reuse, trade finance, market-data delivery, regulator supervision, audit evidence).

**Do not fund if:** access stays inside one org and no external party needs shared proof. Use IAM.

This proposal targets the first case exclusively.

Canton is the right substrate because:

- **Multiparty authoritative state:** owner, recipient, and optional Observer align on one contract.
- **Sub-transaction privacy:** unrelated passports invisible to non-parties.
- **Ledger-enforced transitions:** revoke/expire are contract operations, not hopeful API propagation.
- **Immutable audit trail:** every lifecycle action carries a Canton transaction ID queryable by authorized parties.
- **No payload on-ledger:** governance and evidence only; Web2 storage unchanged.



### Intended outcome

A versioned, documented, open-source reference stack that a Canton builder with **no prior Veilio exposure** can adopt to:

1. Install a published DAR and run the Access Passport lifecycle across ≥2 participant nodes, including **Observer** party.
2. Implement an off-ledger adapter (S3, vault, document store) without changing Daml contracts.
3. Wrap a domain asset using the integrator library and worked examples.
4. Prove revocation and **multiparty logging**: after revoke/expiry, retrievals fail; every allow/deny is logged before response; Observer can reproduce the audit trail from docs.



### Success looks like (12 months post M3)


| Metric                                                           | Target                        |
| ---------------------------------------------------------------- | ----------------------------- |
| External repos importing the DAR or integrator library           | ≥ 3                           |
| Documented third-party adapter implementations (excl. Veilio)    | ≥ 1                           |
| Reference lifecycle running on public DevNet/TestNet             | Live demo + documented tx IDs |
| External projects qualifying for M4 adoption incentive           | ≥ 1                           |
| Veilio production adapter (Veilio-funded, not grant deliverable) | 1                             |


---



## 2. Public-good framing

Per the [Canton Development Fund guide](https://guide.canton.foundation/) and the [2026–2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md), this is an **RFP-aligned** public-good proposal (target submission path: `rfps/financial-markets-standards-verification/`), not a single-vendor commercial product and not an individual initiative outside the roadmap.


| Grant-funded (open)                                       | Explicitly out of scope (Veilio commercial)               |
| --------------------------------------------------------- | --------------------------------------------------------- |
| Access Passport Daml + signed DAR (incl. Observer role)   | Veilio tokenization SDK / vault product                   |
| Off-ledger gateway **interface** + reference file adapter | Production SaaS dashboard / billing / SSO                 |
| Integrator npm library + worked examples                  | Automatic PII discovery / proprietary onboarding          |
| Multiparty compliance log schema + export                 | Formal third-party security audit (recommended follow-on) |
| Adoption guide + KYC + regulator-observer templates       | MainNet production SLA / multi-region ops                 |
| DevNet/TestNet public reference deployment                | Veilio Exchange marketplace product                       |


**Shared benefit:** any bank, KYC provider, RWA issuer, trade-finance app, market-data vendor, or compliance tooling team on Canton can import the DAR and adapter contract. **Veilio Exchange is the first production consumer**, not the grant deliverable nor the only beneficiary. Work focuses on **open standards, interfaces, and reference implementations** — matching RFP #12.1's requirement to avoid proprietary identity/compliance services.

**License:** Apache-2.0; copyright ownership stated at contract signature.

## 3. RFP and strategic roadmap alignment



### Primary : RFP #12.1 Identity, Credentials and KYC Standards for RWA Workflows

RFP #12.1 asks for provider-neutral standards to **issue, verify, reuse, update, and revoke** credentials required for RWA and institutional financial workflows, with:

- recognition of a credential/status across Canton applications without repeating verification,
- Canton's privacy model preserved (prove a requirement is met **without unnecessarily disclosing underlying personal or institutional data**),
- open standards, interfaces, and reference implementations, not proprietary compliance SaaS,
- accounting for Identity and Metadata SIG / CIP work already underway.

**What this proposal is (and is not):** Access Passport is the **governance and reuse layer** for credential *evidence packages* and *status rights* — who may access which package, for what purpose, until when, with multiparty proof of revoke. It is **not** an identity provider, not a KYC decision engine, and not a proprietary compliance SaaS. Credential *issuance decisions* stay with banks, KYC providers, or IdPs; Canton holds the **shared authorization state** so other apps can reuse that work.

#### Credential types covered by RFP #12.1 → passport `purpose` / metadata

Passport metadata carries a typed `credentialType` (and optional `purpose` / `jurisdiction` / `assetClass` fields) so apps can query governance state without reading the off-ledger package:


| RFP #12.1 credential                        | Example Owner → Recipient                       | On-ledger (no PII)                                        | Off-ledger package (adapter)               |
| ------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| **KYC / KYB status**                        | Bank A → Bank B / RWA issuer                    | `credentialType=KYC`, status, expiry, parties             | Identity docs / verification report        |
| **Accreditation / investor qualification**  | Issuer / transfer agent → subscription platform | `credentialType=ACCREDITATION`, scope, expiry             | Qualification certificate / letters        |
| **Licensing / regulatory status**           | Regulated entity → counterparty / marketplace   | `credentialType=LICENSE`, regulator ref (non-PII), expiry | License evidence pack                      |
| **Jurisdiction / residency**                | KYC provider → RWA app enforcing geo rules      | `credentialType=JURISDICTION`, region code, expiry        | Residency evidence (served only if needed) |
| **Authority to act (mandate / PoA)**        | Institution → agent / broker / custodian        | `credentialType=AUTHORITY`, role, expiry                  | Board resolution / PoA documents           |
| **Eligibility to hold / transact an asset** | Issuer → holder / transfer agent                | `credentialType=ELIGIBILITY`, assetClass, expiry          | Eligibility checklist / attestations       |


Same DAR and lifecycle for all six. Apps differ only in metadata and which adapter-backed package they wrap.

#### Cross-application recognition (no repeated verification)

```
KYC Provider / Bank A                Canton Access Passport              RWA App / Bank B
        │                                      │                                │
        │ Completes KYC (Web2 / existing)      │                                │
        │ Issues evidence package off-ledger   │                                │
        │ Propose passport (credentialType=KYC)│                                │
        ├─────────────────────────────────────►│                                │
        │                                      │  Accept · Consent              │
        │                                      │◄───────────────────────────────┤
        │                                      │  Active: purpose + expiry      │
        │                                      │                                │
        │  App B queries: "active KYC passport │                                │
        │  for this party pair / subject ref?" │── yes ─────────────────────────►│
        │                                      │  retrieve package only if       │
        │                                      │  App B needs full evidence      │
```

- **Reuse without re-KYC:** App B recognizes that an active passport exists for `credentialType=KYC` under agreed purpose without calling Bank A's IAM and without re-running verification.
- **Optional deep evidence:** retrieve of the off-ledger package is gated; many workflows only need the **on-ledger status** (active / expired / revoked).
- **Provider-neutral:** any KYC provider or bank can be Owner; any RWA / subscription / custody app can be Recipient by importing the same DAR.



#### Prove a requirement without disclosing underlying data

RFP #12.1: *support proving that a party satisfies a requirement without unnecessarily disclosing the underlying personal or institutional data.*


| Layer                  | What is shared                                                    | What is not shared                       |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| **On-ledger passport** | `credentialType`, purpose, parties, status, expiry, Canton tx IDs | Names, IDs, addresses, document contents |
| **Observer**           | Lifecycle + multiparty access logs                                | Payload bytes                            |
| **Recipient retrieve** | Package content **only if** passport active and purpose allows    | N/A — fail closed otherwise              |


An RWA issuance app can gate a subscription on *"active ELIGIBILITY passport exists"* without ever fetching residency or identity documents into its systems. That is the selective-disclosure pattern at the **governance** layer; cryptographic selective disclosure of payload fields remains out of scope (optional future adapter), consistent with open standards rather than a proprietary IdP.

#### Issue → verify → reuse → **update** → revoke


| Lifecycle verb (RFP) | Access Passport behaviour                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Issue**            | Owner deposits package via adapter; proposes passport with credential metadata                                                                                                                      |
| **Verify**           | Recipient accepts + consents; optional Observer witnesses                                                                                                                                           |
| **Reuse**            | Other Canton apps import DAR and query/exercise against same passport standard                                                                                                                      |
| **Update**           | Owner publishes a **new package version** (adapter) and **supersedes** the prior passport (archive old + issue new with lineage / `supersedesPassportId`); recipients re-consent if policy requires |
| **Revoke**           | Owner (or expiry) archives governing contract; gateway denies retrieve; tx ID is multiparty proof                                                                                                   |




#### Identity and Metadata SIG / CIP coordination, including draft Credentials Standard

RFP #12.1 requires accounting for Identity and Metadata SIG work. The draft **[Canton Network Credentials Standard](https://github.com/canton-foundation/cips/pull/204)** (Simon Meier / Digital Asset, CIP early draft) is the key related artefact. A likely committee question is whether Access Passport duplicates that CIP. **It does not** the layers compose.


| Layer          | Canton Network Credentials Standard (CIP draft #204)                                                        | Access Passport (this grant)                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Job**        | Store, retrieve, and use **credential claims** on Canton (issuer / holder / registry APIs, W3C-VC inspired) | Govern **who may access** an off-ledger evidence package (purpose, expiry, revoke, Observer) |
| **On-ledger**  | Credential claims / registry records (status attributes)                                                    | Passport lifecycle + multiparty access audit tx IDs                                          |
| **Off-ledger** | Out of CIP scope for heavy evidence files                                                                   | Payload via storage-agnostic gateway (S3, vault, API)                                        |
| **Roles**      | Issuer, holder, registry admin, app provider                                                                | Owner, Recipient, Observer, Operator                                                         |
| **Revocation** | Archive credential / holder archive                                                                         | Archive passport → gateway deny + shared proof                                               |
| **Does not**   | Replace IAM for package delivery; not an evidence locker                                                    | Issue KYC decisions; not a credential registry / IdP                                         |


**Composition for RFP #12.1 KYC reuse:**

```
CIP Credentials (claims)     Access Passport (access rights)     Web2 storage
  "party X KYC-verified"  +  "Bank B may retrieve pack       →  evidence package
   by Issuer Y until T"       for purpose Z until T"              via gateway
```

- CIP #204 answers: *what claims exist about a party?*  
- Access Passport answers: *who may fetch the underlying evidence package, for what purpose, with multiparty revoke proof?*  
- Apps that only need a boolean status may use credentials alone; apps that must share documents (KYC pack, PoA, eligibility file) need Access Passport (or reinvent it).

This grant will:

- Map passport `credentialType` / opaque subject handles to CIP credential claim keys as the draft stabilizes.
- Document the boundary in the adoption guide (WS4); invite Identity & Metadata SIG review before M2.
- **Not** fork a competing credentials registry or claim schema.
- Treat CIP #204 as complementary public good; Access Passport is the **governed off-ledger delivery / reuse** primitive CIP #204 intentionally leaves as use-case sketch.



#### Requirement mapping


| RFP #12.1 requirement                     | How Access Passport delivers it                                    |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Issue / verify credentials & packages     | Owner proposes passport over typed credential evidence package     |
| Six credential categories                 | `credentialType` enum + worked examples for each class (lead: KYC) |
| Reuse across apps without re-verification | Shared DAR; App B queries active passport / status without re-KYC  |
| Update                                    | Versioned package + superseding passport with lineage              |
| Revoke                                    | Ledger archive + gateway deny + Canton tx ID proof                 |
| Prove requirement without exposing data   | Status on-ledger; payload optional; Observer never gets payload    |
| Provider-neutral open standard            | Apache-2.0 DAR + gateway interface; Veilio commercial out of scope |
| Identity & Metadata SIG                   | Metadata alignment + documented boundary in adoption guide         |


**Lead example (RFP #12.1):** Bank A completes KYC; RWA App / Bank B reuses verification via an active `credentialType=KYC` passport — querying status first, retrieving the package only if needed; compliance Observes access history without receiving identity documents.

### Secondary — RFP #12.2 Daml and Institutional RWA Workflow Standards

Same primitive generalizes to institutional document workflows named in #12.2: collateral files, trade-finance packages, servicing evidence, post-trade documentation, reusable Daml models and APIs for **access governance** that compose with token/asset standards without replacing them.

### Secondary — RFP #27 Security Monitoring, Auditability and Evidence

Write-ahead multiparty access logs correlated to Canton transaction IDs provide **privacy-preserving compliance evidence** (entity-level, application-scoped): who retrieved what package, when, allow/deny, under which purpose, without global public exposure of private transaction content.

### Vision fit (Capital Markets on Canton)

The roadmap positions Canton as rails for institutional capital markets. RWA issuance and transfer require **credential reuse and governed evidence delivery** between banks, custodians, issuers, and supervisors. Access Passport is a prerequisite primitive for that stack: shared authorization truth for off-ledger KYC and institutional packages, composable with Kaiko Data Standard, CIP token standards, and Featured Apps.

### SIGs

**Financial Workflows & Composability** : KYC reuse, trade docs, collateral, market-data delivery, exchange ↔ market-maker feeds.  
**Regulatory Compliance** : Observer pattern, multiparty logs, GDPR/DORA/NIS2 evidence.  
**Token Standards / Asset Standards** : standard for *governed data-access rights* (not settlement). Complements Identity & Metadata SIG work on credentials without duplicating a full identity product.

### Relationship to Kaiko's Data Standard

[Kaiko's approved Data Standard](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-05-Kaiko-data-standard.md) (prior RWA/standards grant) standardizes how data points are **published and consumed on-ledger**. This proposal standardizes **who may retrieve the underlying off-ledger payload / credential package**. The layers compose: Kaiko answers *what is the quote*; Access Passports answer *who may access the dataset or KYC package and under what purpose*.

## 4. What already exists vs. what is net-new



### Already exists (Veilio Exchange PoC, not grant-funded)


| Artifact                                                            | Status         |
| ------------------------------------------------------------------- | -------------- |
| Daml governance frameworks (consent, permission, revocation, audit) | Shipped in PoC |
| Multi-node lifecycle demonstration                                  | Shipped        |
| Reference API + dashboard (propose / accept / consent / revoke)     | Shipped        |
| One-command local Canton deployer                                   | Shipped        |
| SDK/protocol assessment and scope baseline                          | Pre-delivery   |




### Net-new (grant-funded)


| Artifact                                                                                                                 | Why it is ecosystem-critical                                             |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Hardened Access Passport with **Observer role**, `credentialType` **metadata**, and single authoritative on-ledger state | Maps to RFP #12.1 credential categories; no conflicting bilateral truths |
| Automated **governance + multi-node + concurrency** CI suite                                                             | Objective acceptance for adopters and reviewers                          |
| **Versioned signed DAR** + install docs + signing-key custody procedure                                                  | Trustworthy reuse across organizations                                   |
| **Storage-agnostic adapter interface** + reference file adapter                                                          | Any builder, any backend, no Veilio dependency                           |
| **Package update / supersede** path (lineage between passport versions)                                                  | RFP #12.1 "update" without silent re-issuance                            |
| **Multiparty write-ahead access log** tied to Canton tx IDs                                                              | RFP #27 + CNIL / AML / DORA evidence pattern                             |
| **npm integrator library** + examples for **all six #12.1 credential types** (KYC lead) + regulator-observer             | Hours-to-integration; cross-app reuse without re-KYC                     |
| **Public DevNet/TestNet** deployment + adoption guide + Identity/Metadata SIG alignment note                             | Visible common good; SIG/CIP boundary documented                         |


Implementation partner **Avicenne Studio** operates approved validators on DevNet, TestNet, and MainNet.

## 5. Product definition, roles, and technical approach



### 5.1 Product definition

**Governed Off-Ledger Data Exchange** is an open reference stack for **multiparty, privacy-preserving shared governance** of credential and package access rights — the operational layer behind RFP #12.1 (issue / reuse / revoke KYC and institutional credentials without repeating verification or putting PII on-ledger). It does not replace internal IAM. It gives cross-org workflows a **shared Canton state** (Access Passport) that owner, recipient, and Observer can verify, while **payloads stay in existing Web2 storage** (S3, vault, database) enforced via a thin gateway.

Veilio Exchange (marketplace UI) is **one consumer**. Any Canton Featured App that today asks *"does party B still have access according to party A's system?"* can instead ask *"what does the shared passport say?"*

### 5.2 Functional roles


| Role          | Actor examples                    | On-ledger                         | Payload access                       |
| ------------- | --------------------------------- | --------------------------------- | ------------------------------------ |
| **Owner**     | Bank, exporter, data vendor       | Propose, issue, revoke, expire    | Full control via adapter             |
| **Recipient** | KYC provider, financier, fund     | Accept, consent, retrieve         | Yes, bounded by purpose/scope/expiry |
| **Observer**  | CNIL, ACPR, auditor, DPO, counsel | Read passport state + audit trail | **No** (governance visibility only)  |
| **Operator**  | Participant ops / gateway ops     | Gateway authZ, not rights source  | Policy-driven; not data owner        |


**Design principle:** Observer is **not** a disguised recipient. Supervisors verify *that access was governed and revoked*, not *the underlying personal data*.

### 5.3 Worked example: CNIL-style tripartite supervision

**Story:** Company A shares a breach-investigation evidence pack with forensic provider B under a purpose-limited passport. CNIL (Observer) supervises the investigation without receiving the pack.

```
Company A (Owner)     Provider B (Recipient)     CNIL (Observer)
      │                        │                         │
      │ Propose passport       │                         │
      │ purpose: investigation │                         │
      ├───────────────────────►│ Accept · Consent          │
      │                        │                         │
      │ Off-ledger retrieve    │◄── allowed while active │
      │ (write-ahead log)      │                         │
      ├────────────────────────┼────────────────────────►│ reads audit + tx IDs
      │ Revoke (e.g. 15 Aug)   │                         │
      ├───────────────────────►│ 403 on next retrieve    │ revocation proof
      │                        │                         │
      │ Export evidence pack   │                         │ independent verification
      │ (logs + Canton tx IDs) │                         │
```

**Evidence pack contains:** passport lifecycle events, retrieve allow/deny log, revocation Canton transaction ID. **No PII on-ledger.**

Same Observer pattern generalizes to ACPR, AMF, internal audit, external auditor (Deloitte-style time-bound read), and ethics boards.

### 5.4 Ecosystem use cases beyond Veilio Exchange


| Vertical / builder type      | Owner → Recipient → Observer           | What the OSS brick enables                        |
| ---------------------------- | -------------------------------------- | ------------------------------------------------- |
| KYC inter-bank               | Bank A → Bank B / KYC → Compliance     | Reuse verification without email of identity docs |
| Trade finance                | Exporter → Financier → Credit insurer  | Invoice/collateral docs, deal-scoped access       |
| Market data (Kaiko-adjacent) | Vendor → Institution → Risk/compliance | Off-ledger dataset behind on-ledger data product  |
| DEX / market maker           | Exchange → MM → Risk                   | Governed sharing of sensitive flow metadata       |
| Oracle / indexer attachment  | Publisher → Consumer → Auditor         | File/report delivery gated by on-ledger signal    |
| VC data room                 | Startup → Fund → Counsel               | Deal-bound access, provable revocation post-close |
| Healthcare / clinical        | Sponsor → CRO → Authority              | Purpose-limited trial packages                    |
| Hackathon / greenfield       | Any participant → Any → Any            | "Hello world" governed file share in hours        |


Concrete integrator validation is encouraged via **M4 adoption incentive** and community comments on the Dev Fund PR. Named design-partner interest on the PR strengthens the public-good case (see Section 11).

### 5.5 Layers


| Layer              | Responsibility                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Client             | Reference app + templates. Never treats app DB as source of truth for rights.                 |
| Off-ledger gateway | AuthZ against active passport; store/retrieve/revoke via adapter; write-ahead multiparty log. |
| Adapter interface  | Storage-agnostic; reference file impl; production vaults plug in later.                       |
| Canton / Daml      | Authoritative Access Passport state + audit trail. **No personal data on-ledger.**            |




### 5.6 Access Passport lifecycle

Owner proposes → recipient accepts & consents → passport active → retrieve allowed while active → revoke or expire archives contract → subsequent retrievals denied.

- State transitions enforced by **signatories/controllers**, not application code.
- Exactly **one** authoritative on-ledger state per passport (per owner-recipient-dataset pair).
- Every lifecycle action emits an audit record with Canton transaction ID (no PII).
- **Multiple recipients** on the same dataset = independent passports (e.g. Recipient B until 30 Aug, Recipient C until 18 Aug), each with its own log chain.



### 5.7 Multiparty compliance logs

Every retrieve attempt is **write-ahead logged before any payload release**:


| Field (illustrative) | Purpose                      |
| -------------------- | ---------------------------- |
| `passportId`         | Which right was exercised    |
| `callerParty`        | Recipient attempting access  |
| `purpose`            | Stated business purpose      |
| `decision`           | `allow` or `deny`            |
| `cantonTxId`         | Correlation to ledger event  |
| `timestamp`          | Ordering for evidence export |


Owner, Recipient, and Observer each read the **events relevant to their visibility scope** (Canton privacy preserved). Export format is SIEM-oriented JSON for GDPR / DORA / institutional audit packs.

**Acceptance:** Observer reproduces full audit trail from published docs and reference deployment **without** receiving payload bytes.

### 5.8 Off-ledger revocation semantics

Revocation withdraws **future** access through the gateway. Copies already downloaded are outside reach (crypto-shredding of delivered copies is out of scope; interface allows future key-destruction adapters).

### 5.9 Contention under bulk operations

Contracts scoped **per bilateral pair** (one owner, one recipient, one dataset) to avoid shared-signatory contention. Concurrent load targets defined in pre-delivery baseline, validated in CI.

### 5.10 Constraints

- No PII on-ledger; only passport metadata and audit references.
- Delivery targets **DevNet/TestNet**; MainNet is a separate later decision.
- Daml SDK + Canton protocol versions **pinned in pre-delivery baseline**, recorded in DAR manifest.
- Semantic versioning + migration guide for breaking changes.
- Auth V1: participant node identity + org-boundary auth to gateway; no standalone IdP/MFA in scope.



## 6. Workstreams and acceptance



### WS1 : Daml contract hardening and publication

- Harden propose / accept / consent / revoke / expire with **Observer** party support.
- Passport metadata: `credentialType` (KYC, KYB, ACCREDITATION, LICENSE, JURISDICTION, AUTHORITY, ELIGIBILITY), purpose, opaque subject handle (no PII), optional jurisdiction/assetClass.
- **Update / supersede** choice: archive prior passport, issue successor with `supersedesPassportId` lineage.
- Immutable audit records with Canton tx IDs.
- CI suite: full lifecycle, revoke-then-denied, expiry-then-denied, supersede lineage, multi-node, observer read-only checks, cross-layer role checks.
- Publish versioned signed DAR + import instructions + key custody procedure.

**Acceptance:** suite green in CI; reviewer imports DAR and reproduces lifecycle including Observer + supersede from docs alone.

### WS2 : Off-ledger governance gateway

- Documented adapter interface: store, retrieve, revoke (vendor-neutral).
- Reference local-file adapter (full lifecycle without production storage).
- AuthZ on every retrieve: caller = passport recipient; passport active and in scope.
- **Write-ahead multiparty access log** before any payload release; SIEM export with Canton tx ID.
- Consistency tests vs ledger, including concurrent volume from baseline.

**Acceptance:** revoked/expired passports unusable for new retrievals; every allow/deny logged before response; Observer audit export demonstrated.

### WS3 : Integrator library

- npm package wrapping submit/query against Canton JSON Ledger API (version pinned in baseline).
- Worked examples covering **RFP #12.1 credential types** (KYC lead + at least accreditation, authority, eligibility) plus trade-document / collateral and **regulator-observer**.
- Query helpers: "active passport for credentialType + party pair?" (status-only path without retrieve).
- One-command E2E propose→revoke and update/supersede examples.
- Semver + changelog.

**Acceptance:** builder with no prior framework exposure reaches working KYC-reuse integration from package + guide alone.

### WS4 : Public deployment and adoption

- Deploy reference stack to DevNet/TestNet via Avicenne (≥2 participant nodes).
- Adoption guide: DAR install, adapter impl, library install, troubleshooting, Canton forum post.
- KYC inter-bank template + regulator-observer template (technical reference, not legal advice).
- Short appendix: **boundary vs CIP Credentials Standard (#204)** / Identity and Metadata SIG; metadata field mapping.

**Acceptance:** reviewer observes lifecycle across two independent participants and reproduces deployment from guide.

## 7. Out of scope

- Veilio tokenization SDK / automatic tokenization onboarding.
- Veilio Exchange marketplace product (commercial).
- Payment, settlement, or on-ledger financial asset logic.
- Production storage connectors beyond the reference adapter.
- Multi-region / enterprise SLA / MainNet production ops.
- Formal third-party security audit (no treasury/funds at risk in this primitive; Veilio pursues ISO 27001 separately).
- Standalone identity / MFA service.
- Post-delivery retainer for protocol drift (quoted separately if needed).



## 8. Architectural alignment with Canton

- **Does not replace IAM:** internal access control stays in each institution; Canton coordinates **cross-org authorization truth**.
- **Chain abstraction:** payloads remain in Web2 storage; gateway enforces Canton passport state via adapter interface.
- **Privacy model:** bilateral contracts with optional observers; payloads never on-ledger.
- **Multiparty authoritative state:** owner, recipient, and Observer read aligned governance; no unilateral reconciliation.
- **Revocation as ledger state:** not a best-effort API call or owner-only log entry.
- **Composability:** domain assets wrap the passport standard; adapters swap without DAR changes.
- **Institutional readiness:** multiparty logs + Canton tx correlation for AML, DORA, GDPR, MiFID narratives.
- **Validator reality:** public reference deployment sponsored by Avicenne (DevNet/TestNet/MainNet operator).



## 9. Milestones, deliverables, funding

Per champion guidance and Dev Fund practice for this class of grant: **~50% of the ask is tied to external adoption**, with a bounded maintenance tranche after delivery.

**Total funding envelope: 2,400,000 CC** (~USD 240,000 at illustrative ~USD 0.10 / CC).


| Bucket                  | CC                  | Share   | Notes                                        |
| ----------------------- | ------------------- | ------- | -------------------------------------------- |
| **Development (M1–M3)** | **1,000,000**       | ~42%    | Hardened DAR, gateway, lib, public deploy    |
| **Maintenance (M5)**    | **200,000**         | ~8%     | 12-month post-M3 support window              |
| **Adoption (M4)**       | **up to 1,200,000** | **50%** | External integrators only; performance-based |
| **Total**               | **2,400,000**       | 100%    |                                              |




### Development (M1–M3)

**Calendar: 8 weeks.** Pre-delivery baseline (SDK pin, scope, concurrency targets) is complete before M1; not grant-funded.


| Milestone                           | Content                                                                                               | Calendar (indicative) | Acceptance (summary)                    | Funding (CC)     | ≈ USD       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------- | ---------------- | ----------- |
| **M1 — Contracts + gateway**        | Hardened DAR (Observer, credentialType, supersede) + CI; adapter + authZ + multiparty write-ahead log | Weeks 1–5             | WS1 + WS2 acceptance met; DAR published | **500,000 CC**   | ~50,000     |
| **M2 — Integrator + public deploy** | npm library + #12.1 examples; CIP #204 boundary note; DevNet/TestNet; adoption guide                  | Weeks 6–8             | WS3 + WS4 acceptance met                | **450,000 CC**   | ~45,000     |
| **M3 — UAT / stabilisation**        | Multi-participant validation, concurrency tests, doc fixes, forum post                                | Week 9                | Engagement-level acceptance table green | **50,000 CC**    | ~5,000      |
|                                     |                                                                                                       |                       | **Development total**                   | **1,000,000 CC** | **100,000** |




### M4 — Ecosystem adoption incentive (~50% of ask, performance-based)

**Critical for reviewers:** adoption funding is paid only for **independent external** use of the **open Access Passport** artefacts — **not** for Veilio Exchange (commercial) traffic, and **not** for Veilio-operated production apps. Veilio may still ship the first production *adapter*, but that usage **does not unlock M4**.


| Parameter                  | Value                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| **Per qualifying project** | **100,000 CC** (~USD 10,000 at illustrative rate)                                                  |
| **Cap**                    | **12 projects → up to 1,200,000 CC**                                                               |
| **Window**                 | 18 months from M3 acceptance                                                                       |
| **Exclusions**             | Veilio, Avicenne, affiliates; **Veilio Exchange** and any Featured App owned/controlled by grantee |


**Acceptance (per claim)**

- Independent Canton builder / Featured App (not excluded above) integrates published **Access Passport DAR** and/or **integrator library** on DevNet, TestNet, or MainNet.
- Public evidence: repo link, import commit, or documented tx IDs for full lifecycle (propose → accept → consent → retrieve → revoke), ideally with a RFP #12 `credentialType`.
- One claim per distinct external product/team.
- Canonical DAR / template-id manifest pinned at M1 (binding artifact).
- Usage by Veilio Exchange or Veilio commercial surfaces **does not count**, even if they exercise the same DAR.

**Deliverables**

- Public adoption report per claim (project name, use case / credentialType, evidence links, tx IDs).



### M5 — Maintenance (12 months post M3)


| Parameter   | Value                                                                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Funding** | **200,000 CC**                                                                                                                                                                                                                |
| **Window**  | 12 months from M3 acceptance                                                                                                                                                                                                  |
| **Scope**   | Bugfixes for published DAR/lib/gateway interface; Canton/SDK version drift patches; security patches for grant artefacts; community support on GitHub/forum; metadata remapping if CIP Credentials Standard (#204) stabilizes |


**Acceptance:** maintenance plan published at M3; quarterly public changelog during the window; critical breakages from pinned protocol upgrades addressed within agreed SLA (documented at M3).

**Total funding envelope: 2,400,000 CC** (1,000,000 development + 200,000 maintenance + up to 1,200,000 adoption).

**Notes for reviewers**

- Structure follows champion guidance: **adoption ≈ 50%** of the ask; maintenance ring-fenced; development reduced vs prior draft.
- CC amounts use illustrative ~USD 0.10 / CC; material CC/USD moves may be renegotiated per CIP-0100 while the economic envelope intent holds.
- M4 is **performance-based**; unpaid if external adoption does not materialize.
- Formal security audit remains out of scope (no treasury in this primitive).
- **CIP Credentials Standard (#204):** complementary, not competing — see Section 3.



### Engagement-level acceptance (objective)


| Requirement           | Evidence                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Lifecycle correctness | CI suite green every release; one audit record per action             |
| Revocation / expiry   | No new retrievals after revoke/expire (incl. concurrent volume)       |
| Authorisation         | No retrieval without active passport held by calling party            |
| Observer / compliance | Observer reproduces audit trail without payload access                |
| Storage neutrality    | Adapter swap requires no contract change                              |
| Adoptability          | External builder integrates from published artefacts alone            |
| Public deployment     | Lifecycle across ≥2 participants on DevNet/TestNet, docs-reproducible |




## 10. Team and delivery


| Party               | Role                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Veilio**          | Proposer, product owner, first production adapter commitment, ecosystem GTM              |
| **Avicenne Studio** | Delivery: Daml/Canton engineering, gateway, library, DevOps, docs; validator sponsorship |


Avicenne track record: institutional digital-asset infrastructure; Canton validator DevNet/TestNet/MainNet; Usual/USD0, Zama confidential auction infra, ConsenSys/Linea infrastructure.

Delivery in two-week sprints with a demonstrable increment each boundary.

## 11. GTM and adoption strategy

**External OSS adoption is the gated success metric for M4** (~50% of funding). Veilio Exchange (commercial) is a first production consumer of the open interface but **does not count toward M4**.

**Target users (M4-eligible)**

1. Independent Canton builders / Featured Apps: KYC/AML reuse, RWA onboarding, trade finance, collateral, market-data delivery.
2. Banks and data vendors needing **provable** cross-org access without bilateral IAM reconciliation.
3. Compliance tooling needing **Observer**-grade audit trails.
4. Apps composing **CIP Credentials Standard (#204) claims** with Access Passport for evidence-package delivery.

**How we drive Access Passport adoption (not only Exchange GTM)**

- Canton forum / AMA / workshops with KYC + regulator-observer templates.
- Design-partner comments on the Dev Fund PR from non-Veilio builders.
- Explicit CIP #204 composition guide so credential apps plug the gateway without forking.
- Public DevNet/TestNet demo with published tx IDs.

**Initial adoption definition (M4)**

- Distinct external products integrating DAR/lib with public evidence.
- Veilio Exchange usage excluded from claims.



## 12. Risks and mitigations


| Risk                                | Mitigation                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| PoC differs from hardening estimate | Pre-delivery baseline complete; scope changes re-baselined in writing                                                 |
| Perceived as "IAM on Canton"        | Lead with thesis: replaces **unilateral truth**, not IAM; signed logs ≠ shared state; chain abstraction diagram in §1 |
| Adapter interface too narrow        | Validate against ≥1 non-Veilio storage pattern before publish                                                         |
| SDK/protocol drift                  | Versions pinned in baseline; upgrade path in DAR manifest                                                             |
| No formal audit in scope            | Governance + multi-node CI; audit optional before MainNet                                                             |
| Node access delays                  | Avicenne provides validator access / sponsorship directly                                                             |
| Low external adoption               | M4 = 50% of ask, gated on independent builders; workshops + CIP #204 composition guide + forum                        |




## 13. Security notes

- No PII on-ledger by design.
- Gateway fails closed without active passport.
- Write-ahead logging prevents silent disclosure.
- Observer role cannot escalate to payload access via grant deliverables.
- Formal external audit recommended before MainNet promotion of dependent financial apps; out of this funding request.



## 14. Co-marketing

Upon each paid delivery milestone acceptance, Veilio (+ Avicenne as appropriate) will coordinate with the Canton Foundation and champion for technical notes, demo videos, and builder tutorials emphasizing **multipartite compliance** use cases.

## 15. One-liner

> **RFP #12.1:** Open Access Passport for KYC/credential reuse on Canton — shared multiparty governance (not IAM), off-ledger packages, revoke with ledger proof. Veilio ships the first production adapter.



## Appendix A — Related materials

- [2026–2028 Strategic Roadmap & RFPs](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) — primary RFP #12.1; secondary #12.2, #27.
- [DRAFT: Canton Network Credentials Standard](https://github.com/canton-foundation/cips/pull/204) (CIP) — complementary claims/registry layer.
- Veilio Exchange PoC repository and Daml frameworks (shared with champion on request).
- Avicenne Studio technical proposal: *Veilio: Governed Off-Ledger Data Exchange for Canton* (August 2026).
- Champion review call notes: `docs/Call Veilio Kaiko_Charles transcript.md`.



## Summary

**RFP-aligned proposal for RFP #12.1** (Identity, Credentials and KYC Standards for RWA Workflows), with secondary alignment to **#12.2** and **#27**. Open reference stack for **multiparty shared governance** of KYC/credential and institutional package access on Canton. **Canton doesn't replace IAM; it replaces unilateral authorization truth.** Complements (does not fork) the draft [CIP Credentials Standard #204](https://github.com/canton-foundation/cips/pull/204). Hardened Access Passport Daml, gateway over Web2 storage, multiparty logs, integrator library. Public good; Veilio Exchange commercial out of scope for M4.

**Funding:** **1,000,000 CC** development + **200,000 CC** maintenance + up to **1,200,000 CC** external adoption (**total 2,400,000 CC**, ~50% adoption).  
**Champion:** Charles Desmonty (Kaiko). **Target path:** `rfps/financial-markets-standards-verification/`.

## Notes for Reviewers

- **RFP (read first):** Primary **#12.1**; secondary **#12.2** / **#27**.
- **CIP #204:** claims/registry vs Access Passport = governed off-ledger evidence access. Composes for RFP #12.1.
- **Funding shape:** ~50% adoption (external only; **Veilio Exchange excluded**), 200k CC maintenance, 1M CC development.
- **Why Canton:** cross-org authorization truth; IAM stays intra-org; signed logs ≠ shared state.
- Complements Kaiko Data Standard.
- Delivery partner Avicenne: validators DevNet/TestNet/MainNet.

