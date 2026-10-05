# ARU on Canton — what it takes to build the Daml app

**Status:** internal working document, 2026-09-27
**Scope:** the application layer (Daml packages + backend services). Node operations live in `../canton-validator/PLAN.md`.
**Sources:** Canton/Daml docs, CIP texts, Splice repo, ARU internal requirements (`../internal-req/`), brain notes. Items marked *(verify)* are not confirmed.

---

## 1. Where we stand today

| | Status |
|---|---|
| DevNet validator | Live since 2026-07-04, party `arureserve`, Splice **0.8.1** (upgraded 2026-09-11) |
| TestNet validator | Live since 2026-09-14, sponsor GSF, colocated on the same box. **No traffic purchased — it can read but not submit** |
| MainNet | IP whitelisted, not deployed |
| Daml code | **None written** |
| EVM side | ARU ERC-20 deployed on Arbitrum + Base (LayerZero OFT), no supply yet |
| Existing specs | `internal-req/aru-evm-architecture-v1.md` (epoch queue, AP registry, NAV feed), `brain/settlement-control-design.md` (dual-entity control) |

The EVM spec is the functional blueprint. The Daml build is not a port: Canton gives us multi-party authorization, a token standard, and a venue settlement protocol that the EVM design had to hand-roll with Safes, Zodiac modules and a transaction guard.

---

## 2. What Canton gives us, and what we must build

**Free (adopt, don't build):**

- **Token standard (CIP-0056, Final)** — Daml interface packages in `hyperledger-labs/splice/token-standard/`: `splice-api-token-metadata-v1`, `-holding-v1/v2`, `-transfer-instruction-v1/v2`, `-allocation-v1/v2`, `-allocation-instruction-v1/v2`, `-burn-mint-v1`. Implementing these is what makes the token visible in wallets and tradeable on venues.
- **`splice-api-token-burn-mint-v1`** — a standard `BurnMintFactory` whose burn/mint choice is *jointly authorized by the admin plus additional parties*. Our multisig mint/redeem controller is an application of this, not a bespoke mechanism.
- **Allocation API** — the standard way a venue (Temple) locks our token for DvP against a cash leg. Implement it and venues can settle our instrument without bespoke integration.
- **CIP-0112 (Token Standard V2, approved 2026-06-12)** — adds an `Account` model, batch `SettlementFactory`, native mint/burn accounts. New instruments should target V2 while keeping V1 interfaces during migration.
- **Discovery** — registry URLs published as a Canton Name Service metadata entry (`splice.lfdecentralizedtrust.org/registry-urls`); CIP-0103 handles dApp↔wallet connection.
- **Multi-party authorization** — signatories and controllers replace Gnosis Safe + Zodiac Roles + Transaction Guard. The "Vantara approves, Foundation executes" split becomes contract structure, enforced by the ledger.
- **Test harness** — `splice-token-standard-v1-test` / `-v2-test` are published specifically so issuers can build registries against them. `digital-asset/cn-quickstart` gives a Daml + backend + React + LocalNet scaffold.

**We build:**

1. Daml packages: the instrument, the reserve attestation model, the AP queue, the dual-control settlement batch.
2. A **registry backend** — an off-ledger HTTP service implementing the token standard's OpenAPI (metadata, holdings, transfer instructions, allocations). Wallets cannot show the token without it. Alternative: Digital Asset's hosted "DA Registry" product *(commercial terms to verify)*.
3. An **attestation pipeline** — custodian/assurance data signed and written on-ledger, with freshness rules.
4. **Automation services** — window close, batch creation, expiry. Note: **Daml Triggers are deprecated**; automation is a Ledger API client service we run.
5. **Read side + UI** — Participant Query Store (PQS) plus operator/AP/public views.
6. **Key management and signing** for the operator parties.

---

## 3. Target architecture (summary)

Six parties: Issuer (Vantara), Reserve Holder (Acua Reserve Foundation), Operator signers (N-of-M), Authorized Participant, Attestor (custodian or assurance firm), Oracle (RedStone). Auditor/venue as observers.

Daml packages:

- `aru-token` — CIP-0056/0112 instrument: Metadata, Holding, TransferFactory/TransferInstruction, AllocationFactory/Allocation, BurnMintFactory. No business logic.
- `aru-reserve` — `ReserveAttestation` (asset, quantity, custody location, as-of time, attestor signature), `NavQuote` (price, timestamp, source), freshness parameters.
- `aru-policy` — the per-instrument backing rule (see §3a). Same code for every instrument; different configuration.
- `aru-issuance` — `MintRequest` / `RedeemRequest` (AP-submitted, collateral locked), `SettlementBatch` (window close → approval → execution), `IssuanceConfig` (window length, NAV tolerance, signer set, threshold).
- `aru-registry-api` — helper templates the registry backend reads.

The supply rule lives in one place: `SettlementBatch` cannot execute unless post-mint supply ≤ attested reserves *and* the attestation is inside its freshness window *and* the NAV is inside the request's tolerance band.

### 3a. Two instrument profiles, one rule engine

Decided 2026-09-27. A single-metal token and the ARU basket use the same templates, the same lifecycle and the same dual control. What differs is what counts as reserve when the batch executes.

| | Single-metal (Temple) | ARU basket |
|---|---|---|
| Cap | attested quantity of metal M ≥ supply × unit | attested value ≥ supply × NAV |
| Eligible components | allocated metal M only | allocated metals + cash pending procurement |
| Pending-cash allowance | none | bounded (settlement-control note caps operational balances at ≤5% NAV) |
| Extra constraint | — | procurement deadline per pending tranche |

The reason ARU needs the second column: the AP pays cash and the metal is procured afterwards, so at the instant of mint the reserve really is cash. Modelling that explicitly is more defensible than widening the attestation rule or letting an attestor auto-approve. **Rejected: auto-approving the attestor for ARU.** It removes the property the whole design sells — that supply can never exceed independently attested reserves — and it makes ARU's claim weaker than the single-metal token's while both run on the same contracts.

`ReserveAttestation` therefore carries a component class (`AllocatedMetal` | `PendingProcurement`) and the policy decides eligibility, caps and maximum age per instrument. The public view publishes the split, so ARU states its allocated and pending shares rather than a flat "100% backed".

**Open:** the maximum time a pending-procurement tranche may remain pending before minting halts. Business decision, lives in config.

**Dual control maps cleanly to Daml.** On EVM this needed `approveSettlement` restricted to the Vantara Safe, `settle` restricted to the Foundation Safe, plus a guard contract to stop the Foundation's own signers from moving reserves. In Daml, `SettlementBatch` has both entities as signatories on distinct choices: `ApproveNav` (controller: Issuer) and `Execute` (controller: Reserve Holder, requires an existing approval). Neither can act alone, and the ledger enforces it — nothing to bypass.

---

## 4. Build steps

### Phase 0 — Foundations (1–2 weeks)

1. Create `aru-daml` repo. Decide open-source boundary now (grant deliverables are Apache 2.0).
2. Pin the toolchain: Daml SDK version matching the Splice release our validators run (**0.8.1 today**, current tag 0.8.4; docs pair each Splice release to a Canton protocol version). Record the pin in `daml.yaml` and CI.
3. Multi-package layout (`multi-package.yaml`) with the splice token-standard DARs as pinned dependencies. There is no package registry for these: they are built from a pinned splice tag or vendored as binaries.
4. Stand up LocalNet (cn-quickstart) so engineers don't need the shared node.
5. CI: `daml build` + `daml test` on every PR, DAR artifacts versioned.
6. **Package naming and versioning discipline from day one** — Smart Contract Upgrades require a stable package name with strictly increasing versions, and only additive template changes. Getting this wrong at launch makes the instrument un-upgradeable.

### Phase 1 — Thin v1 (3–4 weeks)

Goal: the smallest thing that proves the design and matches Temple's listing requirement (100% same-metal allocation before mint, no yield).

1. `aru-token`: Metadata + Holding + TransferFactory/TransferInstruction, **V2 only**.
2. `aru-reserve`: `ReserveAttestation` with a single trusted attestor party; freshness window.
3. `aru-issuance` minimal: `BurnMintFactory` wrapper where the mint choice requires (a) operator threshold signatures and (b) an attestation covering post-mint supply under the instrument's policy (§3a — single-metal profile first).
4. Daml Script test suite: happy path, stale attestation, over-mint attempt, unauthorized mint, privacy checks (AP cannot see another AP's positions).
5. Deploy to DevNet, then TestNet. Upload + **vet** the DARs (vetting is a separate topology transaction).

Exit: a single-metal token minted on TestNet only against an attestation, visible in a wallet via a stub registry.

### Phase 2 — Registry service (2–3 weeks)

1. Implement the token standard OpenAPI: metadata, holdings, transfer instructions, allocations. Fork the splice test harness rather than starting cold.
2. Publish registry URLs via CNS so wallets discover the instrument.
3. Verify in a real wallet (Canton Wallet SDK; Dfns publishes token standard support) — this is the moment the token becomes "real" to third parties.
4. Decide build vs. DA Registry (hosted).

### Phase 3 — AP queue and dual-control settlement (3–4 weeks)

1. `MintRequest`/`RedeemRequest` with USDCx locked in the request contract. **USDCx is live on Canton; JPMD is announced but not live** — do not design as if JPMD exists.
2. Window close → `SettlementBatch` creation by the automation service.
3. `ApproveNav` (Issuer) and `Execute` (Reserve Holder) choices; N-of-M operator signing on the batch.
4. NAV tolerance check at execution; expiry and refund paths.
5. Automation service against the JSON Ledger API v2 (Triggers are deprecated).
6. Negative tests: partial signatures, expired window, tolerance breach, double-spend of locked collateral, contention under concurrent submissions.

### Phase 4 — Venue settlement (2–3 weeks)

1. Implement `AllocationFactory` / `Allocation` (and V2 `SettlementFactory`) so a venue can lock our token for DvP.
2. Integration test against Temple's settlement flow *(needs Temple engagement — verify what they require)*.

### Phase 5 — Oracle and public reserve view (2–3 weeks)

1. RedStone integration for NAV. RedStone runs as a Canton participant and delivers data via explicit disclosure; it already prices gold (eXAU) and silver (eXAG) for Temple. **RedStone's Canton feeds are pricing; commodity proof-of-reserves on Canton is not live** — the attestation path is ours to build.
2. Keep the attestation interface provider-neutral so an assurance firm's signed attestation and an oracle-delivered one use the same contract shape.
3. Public aggregates contract: attested reserves, supply, ratio, last attestation time — no holder data.
4. Watch **RedStone CAPS** (dev fund PR #497, approved 2026-09-18, 15.775M CC): a hierarchical privacy-preserving push-oracle standard. Align our consumer interface with it rather than competing.

### Phase 6 — Read side and UI (3 weeks)

1. PQS for queries; operator, AP and public views.
2. Operator view is where signers review a batch before signing — this is the human control point, so it needs to show attestation age, NAV source, collateral, and resulting supply in one screen.

### Phase 7 — Audit and MainNet (4+ weeks)

1. Freeze package versions; internal review pass focused on Daml-specific classes: authorization mistakes (wrong signatory/controller), divulgence and privacy leaks, contract key collisions, contention.
2. External audit (Hacken is a Canton ecosystem auditor; ~2–8 weeks and $25K–$350K depending on scope — *get a real quote*). Consider DamlCov coverage gates; DamlFuzz exists but is pre-production.
3. MainNet deployment: sponsor, onboarding secret, DAR upload + vetting, party setup, key custody, runbooks, monitoring.
4. Decide on Featured App status: **CIP-0116 requires locking 25M CC for an asset issuer party** (~$3.4M at $0.136) vs 5M CC for non-issuer apps. This is a business decision, not an engineering one, but it shapes which party issues.

**Rough total: 18–22 weeks of engineering**, excluding audit turnaround and business dependencies (custody agreements, RedStone contract, Temple integration).

---

## 5. Decisions needed before engineering starts

| # | Decision | Recommendation |
|---|---|---|
| 1 | Target token standard V1 or V2 | **Revised 2026-09-28: both.** V2 is what the contracts are written against; V1 is a downcast that routes into the same bodies. Was "V2 only" on 2026-09-27; reading the Splice source settled it — see §6 |
| 2 | Registry: self-build or DA Registry | Self-build for the grant (it must be open source), evaluate DA Registry for production ops |
| 3 | Which party is the issuer on-ledger | Aligns with CIP-0116 lock and the entity structure — Vantara, not Hawkrel. Needs a decision before MainNet |
| 4 | Single-metal first or basket first | Single-metal (Temple's ask, simpler attestation) |
| 5 | Attestor model | Start with one attestor party; design for multiple with an M-of-N attestation rule. Attestations are never auto-approved (§3a) |
| 5a | Oracle | **Decided 2026-09-27: RedStone only.** Align the consumer interface with CAPS; no second provider at launch |
| 6 | Who writes the Daml | In-house + contractor. No contractor identified yet — this is the long pole |
| 7 | Open-source scope | Contracts, registry, UI, docs under Apache 2.0; ARU-specific configuration stays private |

---

## 6. Risks

- **No Daml engineer engaged yet.** Everything else is downstream of this.
- ~~**V2-only is a live risk.**~~ **Closed 2026-09-28 by implementing both.** It was not a risk to monitor, it was a defect. In Splice 0.8.4, Amulet — CC itself — implements V1 *and* V2 on `Amulet`, `LockedAmulet`, `AmuletTransferInstruction` and `ExternalPartyAmuletRules`, and the official `splice-test-token-v2` example does the same; only the v1-era example is single-version. Worse, the reference tooling still reads V1 on its default paths: `token-standard-cli`'s `list-holdings` and `transfer` filter on `HoldingInterfaceV1`, and its `TransferFactoryInterface`/`TransferInstructionInterface` constants point at `transfer-instruction-v1`. And the featured-app proxies that attribute activity to an app provider (`WalletUserProxy`, `DelegateProxy`) are written against `TransferInstructionV1`/`AllocationV1`/`FeaturedAppRightV1` throughout, as is the documented marker wiring. A V2-only instrument could not have used the reward-attribution path at all. The Temple/Wallet-SDK/Dfns verification is no longer load-bearing, though it is still worth doing.
- **Token standard V2 migration** landed three months ago; reference material may lag. Budget time for reading Splice source rather than docs.
- **RedStone single-provider risk.** One oracle is a single point of failure for the NAV cap. Mitigation is the generic consumer interface plus the batch's safe default: if the feed is stale or absent, signers don't sign and nothing mints. Worth raising with RedStone that commodity proof-of-reserves on Canton does not exist yet — with CAPS now funded, we could be their first PoR use case rather than building the attestation path alone.
- **Upgradeability**: a mistake in package naming/versioning at launch is expensive to undo.
- **Attestation is the trust weak point.** The contracts can enforce "supply ≤ attested reserves", but the attestation's credibility is off-ledger. Temple wants a named assurance firm; none is chosen.
- **Registry availability** becomes a production dependency — if it's down, wallets can't render the token.
- **Splice version churn** (weekly releases). Pin per network; never reuse a bundle across networks.
- **CIP-0116 cost** could change which entity issues, late.

---

## 7. Laptop setup (checked 2026-09-27)

**This machine is Windows 11 on a Snapdragon X2 Elite — ARM64.** That is the thing to get right first: Digital Asset ships the SDK for `linux-aarch64`, `linux-x86_64`, `macos-x86_64` and `windows-x86_64`. There is **no Windows ARM64 build**, so a native Windows install runs x86-emulated, JVM and all. WSL2 Ubuntu on this machine is ARM64 Linux, where the `linux-aarch64` SDK runs natively.

**Decision: develop inside WSL2 Ubuntu.** It also matches CI and the Linux validator hosts, and avoids path and line-ending friction.

Present already: Docker 29.6.2, Node 24.17, git, gh, WSL2 Ubuntu, 31.6 GB RAM, 1.3 TB free.
Missing: a JDK (none installed), dpm, VS Code CLI, and — inside WSL — nix, direnv, make.

### Track A — write and test Daml (no network needed)

1. JDK 17+ inside WSL (Temurin 21, ARM64 build).
2. **dpm** — the Digital Asset Package Manager, which replaces the Daml Assistant from SDK 3.5. It reads `daml.yaml` and fetches the matching SDK: `dpm install`.
3. VS Code with the Daml extension, connected to WSL via Remote-WSL.
4. Scaffold `aru-daml`, pin the SDK version, add the Splice token standard packages as dependencies.

This is enough for `daml build` and the whole Daml Script test suite against the in-memory sandbox — which is where Phase 0 and most of Phase 1 actually happen.

### Track B — LocalNet (a full Canton on the laptop)

Needed once we test against real participants, PQS, and the registry: Docker Desktop with 8 GB+ allocated, **Nix ≥ 2.25.2** (it provisions the toolchain), direnv, make, and a Docker Hub login. Then `direnv allow`, `make setup`, `make build`, `make start` from `quickstart/`.

**Open question — ARM64 images.** `canton-open-source` publishes an arm64 variant (verified). Whether the Splice/quickstart images do is unconfirmed; the quickstart docs list macOS and Linux only, with Windows via WSL2, and say nothing about architecture. First thing to try: pull the LocalNet images in WSL and check what comes down. If they are amd64-only, the fallbacks are emulation (slow, three validator nodes), our existing DevNet validator as the dev target, or a small x86 cloud box for integration runs.

### Status — 2026-09-27

Track A is running. Installed in WSL2 Ubuntu 26.04 (aarch64, no sudo needed, everything under `$HOME`):

- Temurin JDK 21 (native ARM64) at `~/.local/opt/jdk-21.0.12.1+1`
- **dpm 3.5.12**, installed from `get.digitalasset.com`, which pulled a native `linux-arm64` build. Components: damlc 3.5.3, daml-script 3.5.3, canton-open-source 3.5.19, codegen, daml-shell, scribe (PQS), upgrade-check.
- `JAVA_HOME` and `PATH` exported from both `~/.bashrc` and `~/.profile` — the latter matters because `.bashrc` returns early for non-interactive shells, which is what automation uses.

Project at `~/dev/aru-daml` (Windows can reach it at `\\wsl.localhost\Ubuntu\home\chris\dev\aru-daml`), git initialised, first commit in. Multi-package layout from the `skeleton` template: `main/` and `test/`.

First modules, deliberately small but real:

- `Aru.Token` — a `Holding` implementing the CIP-0056/CIP-0112 `Holding` interface (V2), with a lock.
- `Aru.Transfer` — `TransferFactory` and `TransferInstruction` (V2).
- `registry/` — the token standard registry API (TypeScript, Node 24, Fastify).
- `Aru.Reserve` — `ReserveAttestation` with `ReserveClass` (`AllocatedMetal` | `PendingProcurement`, per §3a), an as-of time, and a freshness helper.
- `Aru.Issuance` — `MintBatch` with `ApproveNav` (controller: issuer) and `Execute` (controller: reserve holder). `Execute` is guarded on prior approval, matching instrument, asset class, attestation freshness, and `supplyBefore + amount <= attested quantity`.

Nineteen Daml Script tests and 32 registry tests pass, and all eleven guards — eight in Daml, three in the service — are mutation-checked.

The repo is `github.com/arureserve/aru-daml`, private (Chris's call, 2026-09-28), Apache 2.0, pushed.

`Aru.Token.Holding` now implements the Canton Token Standard `Holding` interface. *(Superseded 2026-09-28: this was V2 only, with an explicit account provider. Both parts turned out to be wrong — see the next section.)* A minted holding is read back through the interface in a test and every field of the view is checked, so a wallet that knows nothing about ARU can display it. Locking is not implemented yet, so the view always reports an unlocked holding; transfers, allocations and mint/burn accounts are still Phase 1–2 work.

`Aru.Transfer` implements `TransferFactory` and `TransferInstruction`. A transfer is two-step by default — the sender instructs, the amount is re-created as a holding locked for the receiver, the receiver accepts — with rejection and withdrawal returning it unlocked, and a one-step path when both sides authorize at once. The factory is signed by the admin alone and reached by explicit disclosure, which is how a registry publishes one without making every holder a stakeholder on it. Nineteen scripts pass.

`registry/` is the off-ledger half, in TypeScript on Node 24 (installed natively in WSL; the `npm` that answers first on this laptop is Windows' own, leaking through `/mnt/c`, which would silently have built against the wrong runtime). It implements metadata v1 and transfer instruction v2 — info, instruments, transfer-factory, and the accept/reject/withdraw choice contexts. It is read-only and holds no key that can move an asset: it answers questions and hands out disclosed contracts, and wallets submit for themselves. 32 tests. Two things worth keeping: supply is summed with BigInt rather than doubles, because a registry publishing ten decimal places cannot report `0.30000000000000004`; and responses are validated against the standard's own OpenAPI documents, copied verbatim from the pinned tag, so “implements the standard” is checkable rather than remembered. **The JSON Ledger API adapter has not been run against a live participant** — its shapes come from the API description shipped with Canton 3.5, and confirming it is the first thing to do once a node is reachable.

Getting the interface packages was the only real friction. They are not published to any registry, so `scripts/fetch-token-standard.sh` clones `canton-network/splice` at tag **0.8.4** and builds all thirteen into `dars/`, which stays out of git — the tag is the whole supply-chain statement. Two wrinkles worth recording: the splice packages pin `sdk-version: 3.5.2` (so that SDK has to be installed alongside 3.5.12), and `splice-api-token-burn-mint-v1` lives under `daml/`, not `token-standard/`, unlike its twelve siblings.

**Two things learned that are worth keeping:**

1. **Visibility is not authorization.** The first version had the reserve holder fetching an attestation it wasn't a stakeholder on. Every `Execute` failed on visibility — which meant all five negative tests passed for the wrong reason while the happy path failed. Fixed by making the reserve holder an observer. Lesson: in this codebase a `submitMustFail` proves nothing on its own.
2. **So the suite gets mutation-checked, and it keeps paying.** `scripts/mutation-check.sh` deletes each of the eight guards on its own and requires exactly the test that should catch it to fail. It caught the same trap a second time: `strangerCannotAccept` passed because the stranger cannot *see* the instruction, not because the authority check rejects her — it would have survived deleting the check it claimed to test. It is now `strangerCannotSeeTheTransfer`, which asserts the privacy property directly, plus `adminCannotAcceptForTheReceiver` for the authority check with a party that *can* see the contract. **Every negative test in this codebase should be assumed vacuous until a mutation says otherwise.** Worth doing for each guard we add, and an argument for wiring up DamlCov early. Better still, move the negative tests to `trySubmit` and assert on the specific error rather than on failure in general.

### Status — 2026-09-28

**V1 is in, alongside V2.** Three independent findings in the Splice 0.8.4 source made this not a judgement call:

1. Amulet — CC itself — implements both on every template, and so does the official `splice-test-token-v2` example.
2. The reference `token-standard-cli` still reads V1 on its default paths: `list-holdings` and `transfer` filter on `HoldingInterfaceV1`, and its transfer factory/instruction constants point at `transfer-instruction-v1`. Point that CLI at a V2-only party and it shows nothing.
3. The featured-app proxies, which are how an app's activity is attributed for rewards, are V1 throughout.

It is not a second implementation. `splice-token-standard-utils` 2.0.0 ships `ForwardCompatible`/`BackwardCompatible` with `downcast`/`upcast` for the holding view, plus `transferFactoryV1_transferDefaultImplUsingV2` and the matching accept/reject/withdraw adapters, so the V1 view is a downcast of the V2 view and every V1 choice routes into the V2 body. That package had to be added to `fetch-token-standard.sh` (fourteen packages now, not thirteen).

**Writing the V1 tests immediately found a real defect.** Holdings had `account.provider = Some issuer`, and a V1 caller has no way to name a provider — the standard's upcast builds a *basic* account (`provider = None`). So every V1 transfer failed on "an input holding is not in the sender's account". Holdings now use basic accounts, which costs nothing: the issuer is already the instrument admin and sole signatory, so naming it as account provider added no information while putting the instrument out of V1's reach entirely. This is the kind of thing that would have been found by a wallet integrator, not by us.

**Two traps in the V1 adapters, both now mutation-checked.** V1's instruction choices are *consuming* and V2's are *nonconsuming*, so a shared body must archive on the V2 path only — archive on both and every V1 acceptance double-archives. And the account shape above. Neither shows up in the V2 suite; both break only the V1 tests.

Counts: **26 Daml Script tests, 40 registry tests, 14 mutations**, all landing exactly. The registry now serves `/registry/transfer-instruction/v1/...` as well as v2, from one handler — the two requests differ only in naming parties versus accounts — with `transfer-instruction-v1.yaml` vendored alongside the v2 spec so V1 responses are conformance-checked too.

**The mutation harness had two bugs of its own, both found by running it:**

- Its grep for failing tests was `:[a-zA-Z]+: failed`, which cannot match a name containing a digit. Every test called `v1Something` failed *silently*, and both new mutations read as "broke nothing" — the harness would have certified untested code.
- Two concurrent runs shared one work directory, `/tmp/aru-mutation`, and deleted each other's tree mid-build. The work directory is now per-run, and a build failure prints the compiler output instead of just "build failed", which is how the third problem surfaced: the script depended on the caller's shell having `dpm` on `PATH`, and a non-interactive shell does not. It now resolves the toolchain itself and refuses to run if it cannot.

**DevNet is reachable and the participant is healthy.** Canton 3.5.17, JSON Ledger API on 7575 answering unauthenticated, ledger end advancing, connected to `global`. Ports are not published to the host, so it is `ssh -f -N -L 7575:172.19.0.5:7575 canton-devnet` — tested from Windows. The token standard interface packages are **not** on the participant: of 106 packages it has `daml-stdlib-3.5.2` but none of metadata-v1, holding-v2 or transfer-instruction-v2, so our DARs have to be uploaded and vetted. There is no `FeaturedAppRight` yet; there are two `ValidatorRight` contracts (validator `arureserve::1220debc…781c`, users `arureserve` and `piffie`).

One incidental confirmation: querying the ACS for those contracts exercised the exact `EventFormat` → `filtersByParty` → `TemplateFilter` nesting and `JsActiveContract` unwrapping that `registry/src/jsonLedger.ts` uses, against a real participant. That shape is right. The `includeCreatedEventBlob: true` path is still unproven.

**Featured App is a different party from the validator, and probably from the issuer too.** `FeaturedAppRight` names one arbitrary `provider : Party`, granted by `DsoRules_GrantFeaturedAppRight` and revocable by vote; it has nothing to do with `ValidatorRight`. `InstrumentId.admin`, by contrast, is inside every holding view and every transfer argument, so it cannot change without migrating every holding. Amulet's own registry puts the *receiver's wallet provider* in the featured-app context, not the registry admin, so provider ≠ admin is the normal case. Keeping them separate also keeps the Hawkrel-vs-Vantara entity question open instead of foreclosing it. Cost of separating: our own delegation template, roughly thirty lines modelled on `DelegateProxy` (theirs does not fit — its choices are the outer wrapper the *submitter* calls, and for ARU the submitter is the sender).

Also worth having: on DevNet, `AmuletRules_DevNet_FeatureApp` is controlled by the provider itself and only requires `isDevNet`, so the whole marker → reward path is testable with no SV vote. And the CIP-47 guidance on what markers are *for* reads like ARU's spec sheet — "Lock or unlock a Real World Asset (RWA). Transfer a RWA. Mint or burn tokens." That belongs in the application.

**Still open:** which party posts the CIP-0116 capital lock, and whether it must be the provider — not verified against the CIP text. Decision #3 (issuer entity) now blocks the party layout, not just MainNet.

### Status — 2026-09-29: it runs on DevNet

The whole thing works against a live participant. Uploaded and vetted, dual-control mint executed, holdings read back through both standard interfaces, transfers instructed and accepted over V2 *and* V1, and the registry serving from the same node. Package `e9e20ae1…661fc1`, synchronizer `global-domain::1220be58…471a`.

**The first upload was refused, and that refusal was the most valuable thing that happened all day.**

```
KNOWN_PACKAGE_VERSION: Tried to vet two packages with the same name and version:
  188b090b… (splice-api-token-metadata-v1 v1.0.0)  ← ours, built from splice source
  4ded6b66… (splice-api-token-metadata-v1 v1.0.0)  ← what the network has vetted
```

A package id is the hash of the compiled `.dalf`, and an interface is identified on the ledger *by that id*. `fetch-token-standard.sh` built the token standard from a pinned splice tag, on the stated reasoning that the packages "are not published to any registry, so the only honest options are to vendor the binaries or to build them from a pinned tag." That reasoning was wrong. They are published — inside the release image — and a from-source build produces an interface **no wallet on the network is looking for**.

I checked whether it was version skew: tags 0.8.1 and 0.8.4 have byte-identical sources for that package, pin the same SDK (3.5.2), and both produce `188b090b`. So no tag would have fixed it.

Note how this failed *safely* only by luck. The participant refused because it already had the name at that version. Had it not, the DAR would have uploaded cleanly, every test would still pass, the registry would still answer — and the instrument would have been invisible to every wallet on Canton while looking perfect from the inside. That is the failure mode this project's whole testing discipline exists to catch, and no amount of mutation testing would have caught it, because it is not a property of our code.

Fixed: the script now pulls the DARs out of the published `validator-app` image, **pinned by digest** (`sha256:d7ee400a…88acb`) rather than by tag, since a tag can be moved and this is the supply chain. Verified on a host with docker — the 14 DARs it produces are byte-identical to the ones the running validator serves. Rebuilt on those packages: 26 Daml tests, 40 registry tests, 14 mutations, all still exact.

**What the live run proved that no test could:**

- The two negative cases were refused *by the ledger*, carrying our own assertion text — a reserve holder executing an unapproved mint, and a sender accepting her own transfer. Visibility is not authorization, demonstrated rather than asserted.
- `jsonLedger.ts` works, including the `includeCreatedEventBlob` path that was the one unproven piece. Alice is not a stakeholder on the factory; she exercised it by disclosing the blob the registry handed her. That is the real disclosure mechanism, not a stand-in.
- The V2 view carries a basic account (`provider: null`) and the V1 view carries a bare owner — the same contract, both interfaces, live.
- Supply summed from live holdings in exact decimal: `totalSupply: "100.0"`, conserved across four transfers.

**Party layout as allocated** (namespace `1220debc03e0…781c`): `aru-issuer` (instrument admin — inside every holding view, so effectively permanent), `aru-attestor`, `aru-reserve`, `aru-alice`, `aru-bob`, plus one `aru-app` user with act-as rights over all five. The validator operator party `arureserve` is deliberately none of these.

Two smaller things found on the way: the old default `SPLICE_SRC` put the splice clone *inside* the repo, where `dpm` walks up, finds our `multi-package.yaml` and refuses the package as not a member of it; and disclosed contracts must name a concrete package id, not the `#package-name` form the commands themselves accept.

**Still open:** which party posts the CIP-0116 capital lock. Allocations and mint/burn accounts are still unimplemented. No `FeaturedAppRight` requested yet — on DevNet `AmuletRules_DevNet_FeatureApp` needs no SV vote, so that is testable whenever we want it.

### Status — 2026-10-05: TestNet, and deployment as a script

ARU is now deployed on **TestNet** as well, with the same DAR: `aru-daml-main 0.0.1`, package id `e9e20ae15e19d18a2a4de7203931648a341acc92006de4f1cdd52bb9b4661fc1`, vetted on both networks. The full flow ran there — dual-control mint, both negative cases refused by the ledger, and a transfer instructed and accepted over V1 and over V2.

| | DevNet | TestNet |
|---|---|---|
| participant | Canton 3.5.17 (Splice 0.8.1) | Canton 3.5.16 (Splice 0.8.0) |
| namespace | `1220debc03e0…781c` | `12204294bbec…2600` |
| synchronizer | `global-domain::1220be58c29e…471a` | `global-domain::1220f22a8b8f…8337` |
| transfer factory | `0082adeeac9748…` | `00a63a5b32f41a…` |

This also corrects the note at the end of §7: TestNet **can** submit. Minting and transferring there needed no traffic purchase.

**One DAR, every network.** The thing that could have forced a per-network build is the token standard interfaces, and it does not: those packages are frozen at 1.0.0 and the published binaries are byte-identical across splice releases — checked across `validator-app` 0.8.0 and 0.8.1, the two our stacks run. What differs per network is the participant namespace, and therefore every party id, since a party id is `<hint>::<namespace>`. So nothing in the deployment carries a namespace; it is read off the participant.

**`scripts/deploy.mjs`.** Deploying by hand was a sequence of curl calls in which every step is irreversible: a package upload cannot be undone, a party cannot be deallocated, and a second `TransferFactory` is worse than none — the registry refuses to choose between two of them, and a wallet that disclosed the wrong one fails far from the cause. That last one is not hypothetical: a driver script created a duplicate factory on TestNet during this work, and the only reason it was caught immediately is that the deploy script already refused to proceed with two.

So the script makes every step a check followed by an action, with the check running first *even under `--apply`*. It is dry-run by default, has no dependencies, and running it twice is a no-op:

    pwsh scripts/tunnel.ps1 testnet          # the API is not published on the host
    node scripts/deploy.mjs testnet          # plan only
    node scripts/deploy.mjs testnet --apply

It uploads and vets the DAR, allocates the parties, creates the user that acts for them, and creates the singleton factory; on more than one factory it stops and names the contracts rather than guessing. A rerun on both networks now prints eight `already` lines and `nothing to do`.

`tunnel.ps1` binds the port twice, on the Windows loopback and on the WSL-facing interface. That is not belt-and-braces: the ssh key and host alias live on the Windows side while the repo is checked out in WSL, and a Windows loopback listener is unreachable from WSL, so without the second listener the deploy script cannot see the ledger at all.

**What it takes to ship a change**, settled empirically against TestNet using `/v2/dars/validate`, which the API documents as having no effect on the participant or the ledger:

| | result |
|---|---|
| changed code, still `0.0.1` | **refused** — `KNOWN_PACKAGE_VERSION`, `0f85a9a4…` vs `e9e20ae1…`, both `aru-daml-main v0.0.1` |
| `0.0.2`, no `upgrades:` | accepted |
| `0.0.2` with `upgrades: ../baseline-0.0.1.dar` | accepted |
| upgrade-incompatible change, with `upgrades:` | **build fails** — `The upgraded template Holding has added new fields, but the following new fields are not Optional` |

A package id is the hash of the compiled code, so any change at all means a new `version:`. The `upgrades:` declaration is not required by the participant and is what turns on the compiler's upgrade check — without it the build will happily produce a version that cannot succeed the previous one. Once real holdings exist that stops being a formality, because holdings are upgraded in place rather than reissued. `dpm upgrade-check --both <old> <new>` runs the same checks standalone, for CI; it needs a JDK on PATH, which `dpm build` does not, and it has not been run here for that reason.

One case did not produce evidence and is recorded as such: the incompatible change *without* the `upgrades:` declaration failed on ordinary type errors elsewhere in `Transfer.daml`, not on upgrade checking, so it says nothing either way.

**A click-through** of the DevNet run is published as an artifact (step rail, real request and response bodies, balances). It is a recording of the captured run rather than a live client — the artifact CSP blocks external fetch and the participant sits behind an SSH tunnel — and it is private until shared.

**A second instrument, and an operator view (same day).** ARU-CU — a single-metal copper token, 1 token = 1 kg of allocated LME Grade A copper — is now issued on TestNet alongside the basket: 1,000 kg in issue against a 25,000 kg attestation, held by two parties. This is decision #4 (single-metal first, Temple's ask) made concrete, and it is the generality claim tested rather than asserted: *one package, one transfer factory, two instruments*, distinguished only by the attestations they are minted against. The transfer factory is scoped to the admin rather than to an instrument, and the mint guard reads the instrument off the attestation it is handed, so a new instrument costs an entry in `deploy/environments.json` plus an attestation and a mint. That is a direct answer to the Foundation reviewer's question 2 — "how easily do the contracts generalize, what would a third party need" — in running code.

`scripts/issue.mjs` is the issuance counterpart of the deploy script: attest, create the mint batch, approve the NAV, execute, each as the party that is allowed to, dry-run by default. `--propose` stops after the batch exists, which is the state dual control is for.

`ui/` is a read-only page over the live ledger — attested reserves, supply summed from live holdings, holders, the mint queue and transfers in flight. It is the Phase 6 read side, minus the signing, and it exists for one comparison in particular, described next.

**A finding that matters more than either:** the headline claim "supply can only change when an attestation covers it" is weaker than stated. `MintBatch.Execute` enforces

    supplyBefore + amount <= attested quantity

where `supplyBefore` is a **field on the batch that the issuer fills in**. There is no on-ledger supply total; the registry computes one off-ledger by summing holdings. So the real guarantee is "the issuer's *declared* prior supply plus this mint fits inside the attestation", and an understated figure over-mints without the ledger objecting. The same applies to `maxAttestationAge`, which is per-batch and chosen by the issuer rather than bounded by the instrument.

The fix is an `InstrumentSupply` contract that every mint consumes and recreates, making supply a ledger fact. It serialises mints, which is right for batch issuance. Until then: `issue.mjs` computes `supplyBefore` from the live holdings, and the operator view shows the declared and the summed figure side by side, because that is the comparison the ledger does not make. Those checks are mutation-tested — deleting the over-issuance alert or the declared-vs-live warning each breaks exactly its own test.

Related doc correction: the README claimed a basket "also admits a bounded, time-boxed slice of cash awaiting procurement". It does not — `Execute` hardcodes `att.assetClass == AllocatedMetal`, so only the single-metal policy exists today.

### Version pinning

The SDK version must match the Canton protocol our target participant runs. Both our stacks are on **Splice 0.8.1 (Canton 3.5.17)** as of 2026-09-11. Confirm the SDK↔protocol pairing from the Splice release notes before fixing the pin in `daml.yaml`, and re-check it whenever we move networks.

### Which box (checked 2026-09-27)

Neither existing host can take a LocalNet:

| Host | Spec | Verdict |
|---|---|---|
| `canton-devnet` 204.168.206.5 | 16 GB, runs DevNet + TestNet validator stacks, ~5.9 GiB free | No. Risks the validators |
| `89.167.125.87` (fleet agent box) | x86_64, 4 CPU, 7 GB RAM (3 GB available, 2 GB swap in use), 47 GB free | No. Already had a low-memory kill; LocalNet needs 8–12 GB |

We also hold no working SSH key for `89.167.125.87` — `canton_validator` and `mm_deploy` are both refused as root and ubuntu.

**Recommended path — don't buy anything yet:**

1. Track A on the laptop (WSL2, aarch64 SDK). Covers Phase 0 and most of Phase 1: contracts, Daml Script suite, sandbox.
2. Use the **DevNet validator as the integration target** instead of LocalNet. Uploading and vetting a DAR on an existing participant costs almost nothing in resources, and DevNet has a self-service traffic tap. Work over an SSH tunnel to the loopback-bound admin/JSON APIs.
3. Stand up LocalNet only when we need what it actually provides — multiple independent participants, PQS, Keycloak auth flows, the registry end to end. That is Phase 2–3, not now.

When we do need it: a separate x86_64 box, 16 GB+, ~50 GB free. PLAN.md's own reference point for a 16 GB Hetzner host is about $81/month. Resizing the agent box is an alternative, but it mixes the fleet's uptime with our dev environment, which is how the validators nearly ended up sharing a box.

**Note on TestNet:** superseded on 2026-10-05 — see the status entry above. TestNet turned out to submit fine; the mint and both transfers ran there with no traffic purchase.

---

## 8. What this means for grant PR #87

- **A Dev Fund 2.0 notice was posted on the PR on 2026-09-22 with a 10-day deadline (~2026-10-02)**: add the RFP category and the ecosystem-need framing or the PR gets closed. The v2 draft (`commodity-reserve-infrastructure-v2.md`) does both.
- Phase 0–1 is the pre-approval v1 the draft promises; it is genuinely achievable before a decision.
- **CC is ~$0.136 today** (CoinGecko/Coinbase, 2026-09-27), not the $0.0974 in the v2 draft. 1.8M CC ≈ **$245K**, not $175K. Re-check the ask.
- **CBTC (BitSafe) is the closest precedent**: a non-Amulet issuer on MainNet, 1:1 backed, with Chainlink proof-of-reserve and BitGo custody. Worth citing — it shows the pattern works and that ours is the commodity/physical-custody version.
- Note for accuracy: **Chainlink has been live on Canton since Feb 2026** including proof-of-reserve. Our decision to use RedStone only is a commercial one; the proposal should not imply Chainlink is unavailable.
