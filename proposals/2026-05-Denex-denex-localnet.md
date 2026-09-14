# Denex Canton Localnet

| Field | Value |
| :---- | :---- |
| Author | mgaare |
| Org | Denex |
| Status | Approved |
| Created | 2026-05-08 |
| Approved | 2026-05-21 |
| PR | [#318](https://github.com/canton-foundation/canton-dev-fund/pull/318) | 

---

# 1. Executive Summary

We propose the continued development and open-source release of the
**Denex Localnet**, addressing one of the higest-rated "Critical"
needs identified in the [2026 Developer Experience and Tooling
Survey](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).

**Denex Localnet**: A configurable local Canton network manager that replaces
the current approach of hardcoded, multi-file configuration with a single
declarative configuration file, programmatic API, and CLI for orchestrating,
inspecting, and modifying running local networks.

**Funding Requested:** 8,500,000 CC **Timeline:** 9 months **Team:** 4
developers

---

# 2. Problem Statement

41% of respondents cited environment setup and node operations as the task that
took the longest to "get right." Developers are forced to be **infrastructure
engineers before they can be product builders**. The existing Splice LocalNet
and CN Quickstart approaches require navigating 80-120+ configuration files
spread across Docker Compose fragments, environment files, HOCON configs,
Makefiles, Gradle tasks, and Keycloak realm exports, with hardcoded party hints,
port numbers, OAuth client IDs, and user identifiers scattered throughout.

The survey's highest-urgency rating went to **Local Development
Frameworks**, where developers specifically name-dropped Hardhat,
Foundry, and Anchor as the standard they expect. They want composable,
flexible, and integratable infrastructure tooling for app development,
testing, CI/CD, and other key flows. Currently, they are "cobbling
together" scripts.

There are several different use cases and development flows that we
are targeting:
- Local app development, particularly with multiple participants
- Integration and end-to-end testing
- `testcontainers`-style test orchestration
- CI/CD flows
- Demos and other repeatable/controlled environments

---

# 3. Proposed Solution: Denex Localnet, a Configurable Local Canton Network Manager

**Category:** Local Development Framework

**What it does:** A tool to run, configure, and control Canton local networks
for development and testing, with a single-file declarative configuration model
and both CLI and programmatic APIs.

**Key technical features:**

- **Single-file configuration** for the entire localnet topology: number of
  participants/validators, party and user onboarding, permissioning, and
  network ports, all existing in one file with straightforward syntax
- **Programmatic API** for configuring and modifying local networks
  from application code and test suites, supporting a
  `testcontainers`-style workflow
- **CLI tool** for managing running localnets: start, stop, modify
  topology, onboard parties, inspect state, inspect state and
  metadata, and query tools to support programmatic creation of app
  .env files
- **Runtime state inspection:** Query a running localnet for active users,
  ports, parties, and configuration, enabling programmatic integration without
  hardcoding parameters

**Impact:** Directly addresses the #1 survey finding. Transforms the current
experience of navigating 80-120+ files across Splice LocalNet and CN Quickstart
into a single, readable configuration. Developers can bring up a customized
Canton network in minutes rather than hours, and integrate it programmatically
into their test suites and CI/CD pipelines.

## Examples

Not all details have been finalized, so aspects of these examples are
subject to change. These are intended to help illustrate the design
thinking and capabilities of `denex-localnet`.

### Configuration Files

Configuration for `denex-localnet` is specified in one of two ways: in
a single .yaml file, or via a fluent TypeScript API (examples in below
section). Both support the full featureset.

Here is an example configuration file that is intentionally more
verbose than a realistic user's file, in order to demonstrate features.

```yaml
# Optional. Base port for allocation. SV uses ports starting here; each
# validator gets +100 from the previous one. Default: 5000.
#   SV:           6000-6099  (Keycloak at 6082, web UIs at 6080)
#   alice:        6100-6199  (wallet UI at http://wallet.localhost:6180)
#   bob:          6200-6299  (wallet UI at http://wallet.localhost:6280)
#   admin-vldr:   6300-6399  (wallet UI at http://wallet.localhost:6380)
basePort: 6000
# ---------------------------------------------------------------------------
# Keycloak OIDC backend
# ---------------------------------------------------------------------------
# The Keycloak admin user. Used at startup to bootstrap the realm imports
# AND at runtime by KeycloakAdminClient for runtime user provisioning.
# The admin/password convention is: username == password (everywhere).
auth:
  keycloak:
    admin: admin
    password: admin
# ---------------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------------
# The Super Validator (SV) is IMPLICIT — always exactly one, created
# automatically. You only configure the *regular* validators here.
#
# Two forms are supported:
#
#   validators: 2            # shorthand — creates validator-1, validator-2
#
#   validators:              # detailed — custom names, parties, users
#     - name: ...
#
# IMPORTANT: validator names must produce ≤11 chars after `-` → `_`
# transformation, because Splice enforces a 30-char limit on the derived
# participant node name (`{participantName}-validator_backend`, where
# `participantName = name.replace(/-/g, '_')`).
#
# Examples that work:  alice, bob, val1, app, admin-vldr
# Examples that fail:  alice-validator (33 chars after suffix → crashes splice)
validators:
  # -------------------------------------------------------------------------
  # Validator 1: minimal — just a name
  # -------------------------------------------------------------------------
  # Gets a Participant + Validator App + wallet UI. No application parties
  # or users (just the operator's own Splice-managed wallet-admin user).
  - name: alice
  # -------------------------------------------------------------------------
  # Validator 2: full feature set — parties + users with all rights variants
  # -------------------------------------------------------------------------
  - name: bob
    # Parties allocated on this validator's Participant at startup.
    # Hints become part of the full party ID. Users referencing these
    # hints (or any other hint) auto-allocate them if not pre-listed.
    parties:
      - hint: bob                       # minimum: just a hint
      - hint: trader                    # explicit display name
        displayName: Trader Joe
      - hint: auditor
        displayName: Auditor
    # Users created on this validator's Participant. Each user is fully
    # provisioned end-to-end at startup: ledger account + Keycloak realm
    # account + Splice wallet onboarding.
    #
    # Username == password convention (so 'bob-trader' logs in with
    # password 'bob-trader'). The Keycloak realm for this validator is
    # 'Bob' (title-cased from validator name).
    users:
      # User with a primary party only — gets CanActAs(bob) automatically
      - id: bob-trader
        primaryParty: bob
      # User with primary party AND additional per-party rights
      - id: bob-readonly
        primaryParty: bob
        parties:
          - hint: trader                # defaults to [CanActAs]
          - hint: auditor
            rights: [CanReadAs]         # explicit rights list
      # User with multiple per-party rights, no primary party
      - id: cross-reader
        parties:
          - hint: bob
            rights: [CanReadAs]
          - hint: trader
            rights: [CanReadAs, CanExecuteAs]
      # User referencing an UNDECLARED party — auto-allocated at startup
      - id: dynamic-user
        primaryParty: late-bound        # not in `parties:` above; auto-allocated
        parties:
          - hint: also-new              # also auto-allocated
            rights: [CanActAs]
      # Admin-only user — no party at all
      - id: bob-admin
        rights:
          - ParticipantAdmin            # full admin access on this Participant
      # User with multiple participant-wide rights (admin variants)
      - id: bob-superuser
        rights:
          - ParticipantAdmin
          - CanReadAsAnyParty
          - CanExecuteAsAnyParty
          - IdentityProviderAdmin
  # -------------------------------------------------------------------------
  # Validator 3: short-named, focused on package upload routing
  # -------------------------------------------------------------------------
  # `admin-vldr` becomes `admin_vldr` in the participant name (10 chars,
  # leaving room for `-validator_backend` → 28 chars total ≤ 30).
  # Realm: 'AdminVldr'.
  - name: admin-vldr
    parties:
      - hint: ops
    users:
      - id: ops-user
        primaryParty: ops
        rights: [ParticipantAdmin]
# ---------------------------------------------------------------------------
# DAR packages to upload after startup
# ---------------------------------------------------------------------------
# Each package is uploaded to the listed validators. Default: all validators.
# Paths are resolved relative to YAML file's directory.
packages:
  # Upload to all validators (and the SV)
  - name: my-app
    dar: ./dars/my-app.dar
  # Upload to specific validators only
  - name: bob-only-extension
    dar: ./dars/bob-extension.dar
    uploadTo:
      - bob
  # Upload to a subset
  - name: shared-types
    dar: ./dars/shared-types.dar
    uploadTo:
      - alice
      - bob
```

---

### Typescript API

1. Quickstart — config from YAML

```ts
import { LocalNet } from '@denex/localnet/sdk';

const net = await LocalNet.fromConfig('./localnet.yaml');
await net.start();

const status = await net.status();
console.log(`State: ${status.state}, containers: ${status.containers.length}`);

await net.destroy({ removeVolumes: true });
```

---

2. Programmatic config — fluent builder

```ts
import { LocalNet, LocalNetBuilder } from '@denex/localnet/sdk';

const config = LocalNetBuilder.create()
  .addValidator('alice', {
    parties: ['alice'],
    users: [{ id: 'alice-user', primaryParty: 'alice' }],
  })
  .addValidator('bob', { parties: ['bob'] })
  .withBasePort(6000)
  .withAuth('admin', 'admin')
  .build();
  
const net = await LocalNet.fromConfig(config, { instanceId: 'demo' });
await net.start();
```

Or even simpler:

```ts
const config = LocalNetBuilder.create()
  .withValidators('alice', 'bob', 'charlie')  // 3 named validators
  .build();
```
  
---
3. Runtime user and party creation

A single ergonomic call that provisions a user with parties end-to-end: ledger account + Keycloak realm user + Splice wallet onboarding. Referenced parties are auto-allocated. Username = password.

```ts
import { LocalNet } from '@denex/localnet/sdk';

const net = await LocalNet.fromConfig('./localnet.yaml');
await net.start();

// Simplest case: just a primary party
await net.createUser('alice', 'validator-1', { primaryParty: 'alice' });
// → alice can now log into wallet.localhost:5180 with alice/alice

// With multiple per-party rights
await net.createUser('charlie', 'validator-1', {
  primaryParty: 'alice',
  parties: [
    { hint: 'bob', rights: ['CanReadAs'] },        // read-only access to bob's party
    { hint: 'dave' },                              // defaults to CanActAs
  ],
});

// Admin-only user (no primary party)
await net.createUser('admin', 'validator-1', {
  rights: ['ParticipantAdmin'],
});

// SV-specific user — realm name automatically resolved to 'SV' (not 'Sv')
await net.createUser('sv-helper', 'sv', { rights: ['ParticipantAdmin'] });
```

Idempotency: re-calling with the same args is safe — each side (ledger, Keycloak, wallet) converges. Partial failures are recoverable; just call again.

---

4. Attach to a running instance (no config file needed)

Useful for CLI tools, dashboards, or tests that drive an existing LocalNet:

```ts
import { LocalNet } from '@denex/localnet/sdk';

// Discovery
const instances = await LocalNet.discover();
console.log(instances.map(i => i.instanceId));

// Attach by ID (reads config back from Docker labels)
const net = await LocalNet.fromInstanceId('demo');

// Now query state directly
const parties = await net.getParties();
const users = await net.getUsers('validator-1');
const dsoPartyId = await net.getDsoPartyId();
```

---

5. State queries

All require a running LocalNet (enforced internally):
```ts
// Per-validator or aggregated across all
const allParties = await net.getParties();
const aliceParties = await net.getParties('validator-1');

const users = await net.getUsers('validator-1');
const usersWithRights = await net.getUsersWithRights('validator-1');
for (const u of usersWithRights) {
  console.log(`${u.id}: ${u.rights.length} rights`);
}

// One snapshot of everything
const snapshot = await net.getSnapshot();

// Single calls
const partyId = await net.getValidatorPartyId('validator-1');
const dsoPartyId = await net.getDsoPartyId();
const packages = await net.getPackages();
```

---

6. Mutations — parties and DARs

```ts
// Allocate an additional party (createUser does this automatically for referenced hints)
const party = await net.allocateParty('alice', 'validator-1', 'Alice');

// Upload a DAR to all validators...
const packageId = await net.uploadDar('./my-app.dar');

// ...or to specific validators only
await net.uploadDar('./my-app.dar', ['validator-1', 'validator-2']);
```

---

7. Web UI access — credentials and endpoints

```ts
// All credentials needed to log in (username = password convention)
const creds = await net.getCredentials();
for (const c of creds) {
  console.log(`${c.realm} | ${c.url} | ${c.username}/${c.password}`);
}
// SV          | http://sv.localhost:5080      | sv-admin/sv-admin
// SV          | http://wallet.localhost:5080  | sv-admin/sv-admin
// Validator1  | http://wallet.localhost:5180  | validator-1/validator-1

// API endpoints keyed by validator
const endpoints = await net.getEndpoints();
console.log(endpoints['validator-1'].ledgerApi);  // http://localhost:5101
console.log(endpoints.sv.validatorAdminApi);

// Full environment (URLs + auth config)
const env = await net.getEnvironment();
```

For pre-startup credential lookup (no Docker needed), use the standalone helpers:

```ts
import { getCredentials, loadConfigFile } from '@denex/localnet';
const config = await loadConfigFile('./localnet.yaml');
const creds = getCredentials(config.validators, config.basePort);
```

---

8. Lifecycle control

```ts
const net = await LocalNet.fromConfig('./localnet.yaml', { instanceId: 'test-1' });

await net.start({
  timeout: 120_000,
  skipInitialization: false,  // default: runs createUser for each YAML user
  onProgress: (msg) => console.log(`[start] ${msg}`),
});

// ... use it ...

await net.stop();          // graceful stop, preserves volumes
await net.destroy({ removeVolumes: true });  // remove containers + data
```

---

### CLI

The CLI inclues these functions, as taken from the current help output:

```
Description:

  Canton LocalNet management CLI

Options:

  -h, --help             - Show this help.
  -V, --version          - Show the version number for this program.
  -c, --config   <path>  - Path to config file

Commands:

  start         - Start the Canton LocalNet
  stop          - Stop the Canton LocalNet
  status        - Show LocalNet status
  destroy       - Destroy the LocalNet and remove all containers, networks, and data
  init          - Initialize resources on a running LocalNet (create users, link parties)
  config        - Generate a localnet.yaml configuration file
  parties       - List parties on the LocalNet
  packages      - List packages on the LocalNet
  env           - Show environment info for the LocalNet
  credentials   - Show login credentials for web UIs
  instances     - List running LocalNet instances
  entitlements  - List users with their rights on the LocalNet
  discovery     - Discovery server for managing multiple LocalNet instances
```

---

## 4. Comparison with Existing Solutions: Denex Localnet vs. CN Quickstart / Splice LocalNet

Both Splice and CN Quickstart (via splice Localnet) include a localnet
functionality. They come with a fixed set of participants/validators, users,
parties, and network ports.

If a user wants to change that configuration, it's incumbent on them
to navigate through dozens of Hocon files, environment files,
configuration files, Docker Compose manifests, and so forth. There is
no single source of truth or easily understandable and editable
configuration mechanism.

The developer experience story for integrating an app to use for
development on a Quickstart or Splice localnet involves hardcoding
various ports, party ids, user credentials, and other network
information. These tools lack a mechanism to query their state to
discover this metadata.

Orchestration of flows involving OIDC user creation, participant
onboarding, party creation, and entitlement management are left to the
user.

These tools include no programmatic APIs to manage their lifecycles
and state as part of CI/CD orchestration or application testing. Aside
from start/stop scripts, no command line tools are included to support
these flows either.

Much of the above represents table stakes for developer experience and
support for development and test flows for infrastructure tooling. The
`denex-localnet` tool provides these missing pieces in a wholistic
way.

---

# 5. Development Roadmap

## Phase 1: Open-Source Release

| Milestone; Deadline      | Deliverable              | Requested Funding (CC) | Description                                                 |
|--------------------------|--------------------------|------------------------|-------------------------------------------------------------|
| 1.1; Approval + 3 months | Localnet initial release | 1,000,000              | Command line utility and API to manage local Canton network |

**Phase 1 Funding Requested: 1,000,000 CC**

## Phase 2: Ecosystem Integration

| Milestone; Deadline      | Deliverable           | Requested Funding (CC) | Description                                          |
|--------------------------|-----------------------|------------------------|------------------------------------------------------|
| 2.1; Approval + 6 months | localnet distribution | 1,000,000              | Self-contained single file distribution for cli tool |
| 2.2; Approval + 6 months | Documentation         | 250,000                | Unified documentation site                           |
| 

**Phase 2 Funding Requested: 1,250,000 CC**

## Phase 3: Hardening

| Milestone; Deadline      | Deliverable                 | Requested Funding (CC) | Description                                                                                                                                                                     |
|--------------------------|-----------------------------|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 3.1; Approval + 9 months | Localnet hardening releases | 1,000,000              | Harden configuration validation, regular updates to incorporate Splice releases and a selection mechanism; improve CI/CD integration based on community experience and feedback |

**Phase 3 Funding Requested: 1,000,000 CC**

---

# 6. Funding & Resources

**Total Canton Coins requested**: 8,500,000 CC

| Phase / Commitment; Deadline                    | Amount (CC) | Trigger                               |
|----------------------------------------------------|-------------|---------------------------------------|
| Phase 1; Approval + 3 months                       | 1,000,000   | Committee acceptance of deliverables  |
| Phase 2; Approval + 6 months                       | 1,250,000   | Committee acceptance of deliverables  |
| Phase 3; Approval + 9 months                       | 1,000,000   | Committee acceptance of deliverables  |
| Acceleration of Phases 1-3; Approval + 6 months    | 250,000   | Committee acceptance of deliverables  |
| Adoption of Denex Localnet                      | 5,000,000  | 1,000,000 CC per instance of repo used by a production-scale or representative Canton deployment; maximum of 5,000,000 CC or 5 instances |

## Adoption Requirements

This milestone focuses on validating the tools with real-world Canton app development and ensuring its usability across diverse applications. Denex will:
- Collaborate with the Canton Foundation and ecosystem to onboard at least 5 member companies or representative Canton deployments
- Support these teams in running the tool on their codebases
- Collect feedback and refine the tool’s output and usability
- Attestation of participation or usage of the tool
- Evidence of successful runs across participating projects

## Team Composition (8 developers)

| Role                            | Count | Focus                                                               |
| ------------------------------- | ----- | ------------------------------------------------------------------- |
| Infrastructure/DevOps Engineers | 3     | Denex Localnet, Docker orchestration, CI/CD                         |
| Technical Writer / DX Engineer  | 1     | Documentation, tutorials, sample applications, developer onboarding |

## Resource requirements

Engineering team (4 developers) Infrastructure & tooling (CI/CD, hosting,
testing) Documentation, design & community feedback Contingency & open-source
maintenance buffer

## Volatility Stipulation

This grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months, the remaining un-minted milestones will be renegotiated to account for any significant USD/CC price volatility.

---

# 7. Timeline & Scope Risk Management

Denex explicitly assumes the financial risk of executing engineering phases (Phases 1-3) parallel to incorporating community feedback. 
Should the community discussion change the scope presented in the above Phases, Denex absorbs the wasted work of working against an in-flux specification without requesting supplemental Foundation funds. 
Only if major scope is added to the proposal as part of the community discussion will the delivery milestone rewards be revisited.

---

# 8. Team Qualifications

The Denex team has been building on the Canton Network since its early days,
with deep experience across the Daml/Canton stack:

- **Active builders:** We are the developers behind the Denex platform, the
  creator of the Denex Gas Station and provider of Canton application hosting
  infrastructure. Our tools are born from solving real problems in production.
- **Infrastructure expertise:** With Cumberland, Denex has ben 
- **Ecosystem contributors:** We have first-hand experience with the developer
  pain points identified in the survey; our tools were built because we
  encountered these gaps ourselves.
- **TypeScript and tooling expertise:** Our team includes engineers with
  backgrounds in compiler tooling (Tree-sitter, code generation), TypeScript SDK
  design (OpenAPI, Zod, tRPC), and infrastructure automation (Docker,
  Kubernetes).
- **Existing, working code:** Unlike a speculative proposal, we are presenting
  **functional, tested tools** with integration test suites running against
  Canton sandboxes. This grant funds maturation and open-source release, not
  greenfield R&D.

---

# 9. Open-Source Commitment

The localnet developed under this grant will be released under the **Apache 2.0**
license:

- **Denex Localnet:** https://github.com/denex-io/denex-localnet

---

# 10. Alignment with Canton Network Priorities

This proposal directly addresses the Canton Network's stated priority rated as "Critical" or highest urgency from the
2026 Developer Experience and Tooling Survey: **Local Development Frameworks**, for a single-file config, CLI, programmatic API (the "Hardhat for Canton").

---

_Submitted by the Denex Team for consideration by the Canton Development Fund
Grants Committee._
