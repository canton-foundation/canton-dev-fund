## Development Fund Proposal

**Author:** Petr Mensik, Ruby Nodes
**Status:** Draft  
**Created:** 2026-03-16  

---

## Abstract

Canton's local tooling ships one topology: the full cn-quickstart bundle. Developers who need non-default shapes — multi-synchronizer contract transfers, sequencer high-availability, synchronizer-scoped isolation — must hand-write Canton HOCON configurations, compose services, and bootstrap scripts from scratch. No starter tooling exists for these patterns.

The **Modular Local Canton Topology Composer** (`canton-compose`) is a CLI that generates runnable local Canton environments from curated topology profiles. It produces Docker Compose files, Canton bootstrap configurations, environment files, and an endpoint map. Five profiles ship: `minimal` and `two-party` for lightweight development, plus `topology-lab`, `ha-sequencer`, and `partitioned` for topologies that no existing tool generates.

---

## Specification

### 1. Objective

`cn-quickstart` provides a complete, opinionated local environment. It bundles a Canton node multiplexing three participants, a sequencer, and a mediator into one container. A second container multiplexes three Splice validators. Postgres, nginx, web UIs, and onboarding scripts round out the stack. Docker profiles can disable role groups, and optional modules add functionality.

**The topology is fixed.** The canton container always starts from a bootstrap configuration that initializes all three participants, one sequencer, and one mediator. You cannot run a single participant without the others because they share a process and a bootstrap script.

**Non-standard topologies do not exist.** A developer testing multi-synchronizer contract transfers needs two independent sequencer-mediator pairs wired to shared participants. This requires writing Canton HOCON configuration that initializes two synchronizers, connects each participant to both, allocates separate ports for each sequencer and mediator, and coordinates the bootstrap sequence. There is no compose configuration, no Canton bootstrap script, and no profile for this shape in any current tooling.

Similarly, testing sequencer high-availability (two sequencer nodes serving one synchronizer) or synchronizer-scoped isolation (participants connected to disjoint synchronizers) are real operational patterns for which no local starter environment exists. Teams that need these topologies build them from scratch — writing Canton configs, compose services, env files, and bootstrap scripts that are error-prone and never shared.

The composer generates these topologies deterministically. A developer runs `canton-compose generate --profile topology-lab` and gets a working multi-synchronizer environment: compose files, Canton bootstrap configs, env files, and an endpoint map. The configurations are tested against specific Canton versions and known to produce the expected node topology on startup.

### 2. Implementation Mechanics

#### Profile-driven generation

The composer is organized around profiles. A profile is a declarative specification of a local Canton topology: which participants to run, how many synchronizers, what supporting services to include, what ports to expose, what Canton bootstrap configuration to generate. Profiles are not arbitrary — they are curated, tested, and documented.

The initial profile set covers five topologies. The first two validate the generation pipeline and serve lightweight development use cases. The latter three are the core deliverable — topologies that cannot be built from existing Canton starter tooling.

**`minimal`** — One participant, one sequencer, one mediator, one Postgres instance. No validators, no web UIs, no nginx. Exposes Ledger API, Admin API, and JSON API on fixed ports. The lightest possible Canton environment for pure Daml contract development.

**`two-party`** — Two participants (Alice, Bob), one sequencer, one mediator, one Postgres instance. Both participants connected to the same synchronizer. For testing cross-party workflows: contract creation, exercise, divulgence, authorization. Each participant gets its own Ledger API and Admin API ports.

**`topology-lab`** — Two participants, two sequencers, two mediators (two independent synchronizers). Both participants connected to both synchronizers. For testing multi-synchronizer workflows: party migration, contract transfers between synchronizers, synchronizer-scoped vetting behavior. This topology does not exist anywhere in current starter tooling.

**`ha-sequencer`** — Two participants, one synchronizer with two sequencer nodes, one mediator, one Postgres instance. The two sequencers serve the same synchronizer in a high-availability configuration. For testing sequencer failover behavior, sequencer pruning under HA, and validating that applications handle sequencer switchover correctly. This is how Canton runs in production but has no local development equivalent.

**`partitioned`** — Two participants, two synchronizers. Each participant is connected to only one synchronizer — no overlap. For testing synchronizer-scoped visibility, isolation guarantees, and confirming that contracts on one synchronizer are invisible to participants on the other. The opposite wiring of `topology-lab` (where every participant connects to every synchronizer).

Each profile is defined as a YAML file in the profile catalog. Profiles are versioned and pinned to specific Canton release ranges.

Example profile definition (`topology-lab`):
```yaml
profile:
  name: topology-lab
  canton_versions: ["3.4.x"]
  description: "Two participants, two independent synchronizers, full mesh connectivity"

synchronizers:
  - name: sync1
    sequencers: 1
    mediators: 1
  - name: sync2
    sequencers: 1
    mediators: 1

participants:
  - name: alice
    connects_to: [sync1, sync2]
  - name: bob
    connects_to: [sync1, sync2]

services:
  postgres:
    databases: auto  # one per node
```

#### Module catalog

Profiles compose from a catalog of reusable modules. Each module is a directory containing:

- A Docker Compose service fragment (a partial `compose.yaml` defining one service).
- A Canton configuration fragment (a `.conf` snippet for that node type).
- An environment file template.
- A metadata file declaring the module's dependencies and exposed ports.

The module catalog:

| Module | What it provides |
|---|---|
| `participant` | A single Canton participant node (Ledger API, Admin API, JSON API). Parameterized by name, port range, and synchronizer connection list. |
| `sequencer` | A single Canton sequencer node. Parameterized by synchronizer name and sequencer index (for HA configurations). |
| `mediator` | A single Canton mediator node. Parameterized by synchronizer name. |
| `postgres` | PostgreSQL instance with per-component database initialization. |

Modules are parameterized. The `participant` module takes a name (e.g., `alice`, `bob`), a port range, and a list of synchronizers to connect to. The `sequencer` module takes a synchronizer name and an optional index for HA deployments where multiple sequencers serve the same synchronizer. The generator resolves these parameters from the profile definition and produces concrete compose services.

#### Generation pipeline

The `canton-compose generate` command takes a profile name and produces:

1. **`compose.yaml`** — A complete Docker Compose file with one service per module instance. Services use the standard Canton and Postgres images from the cn-quickstart image repository.
2. **Canton bootstrap configuration** — A `.conf` file (HOCON format) that initializes the specific nodes defined by the profile. This replaces the monolithic bootstrap script that the current LocalNet uses to start all nodes in one container.
3. **Environment files** — `.env` and per-service env files, following the same layering convention as cn-quickstart (`.env` → `.env.local` → service-specific).
4. **Endpoint map** — A JSON file listing every exposed API endpoint (participant Ledger APIs, Admin APIs, JSON APIs, sequencer public APIs) with host, port, and protocol. Used by downstream tools and test automation.
5. **Port allocation table** — Follows the cn-quickstart convention (prefix by role, suffix by API type) but supports custom overrides via profile parameters.

The generated output is plain files. No runtime daemon, no wrapper process, no custom Docker plugin. The developer runs `docker compose up` on the generated output. The composer generates; Docker Compose runs.

#### Tech Stack

The `canton-compose` CLI will be implemented in Kotlin and compiled to a zero-dependency, stand-alone native binary using GraalVM Native Image. This provides sub-second startup times appropriate for a CLI tool, while allowing the implementation to leverage the deep Java/Kotlin ecosystem for robust parsing, validation, and generation of HOCON (`typesafe-config`) and YAML formats. It will be distributed as pre-compiled binaries for Linux (amd64) and macOS (amd64, arm64).

#### Example generated output

For the `topology-lab` profile, the generator produces Canton bootstrap configuration that wires two participants to two independent synchronizers. A representative generated `.conf` snippet structure is:

```hocon
canton {
  participants {
    alice {
      storage.type = postgres
      storage.config.properties.databaseName = "alice_db"
      ledger-api.port = 10011
      admin-api.port = 10012
      init.auto-init = true
    }
  }
  sequencers {
    seq_sync1 {
      storage.type = postgres
      storage.config.properties.databaseName = "seq_sync1_db"
      public-api.port = 10021
      admin-api.port = 10022
      sequencer.type = reference
    }
    seq_sync2 {
      storage.type = postgres
      storage.config.properties.databaseName = "seq_sync2_db"
      public-api.port = 10031
      admin-api.port = 10032
      sequencer.type = reference
    }
  }
  mediators {
    med_sync1 {
      storage.type = postgres
      admin-api.port = 10023
    }
    med_sync2 {
      storage.type = postgres
      admin-api.port = 10033
    }
  }
}
```

The bootstrap script then connects each participant to both synchronizers via their sequencer endpoints. For the `ha-sequencer` profile, the generated sequencer section contains two sequencer nodes for the same synchronizer. These wiring rules are what make each profile more than a compose template.

#### Non-goals

- **Not production orchestration.** The generated environments are for local development. They run on Docker Compose on a single machine. Kubernetes, Helm, Terraform, and multi-machine deployment are out of scope.
- **Not a replacement for Quickstart.** Quickstart is the on-ramp for new Canton developers. It provides a full working application (licensing demo, web UIs, onboarding scripts). The composer does not include application code, web UIs, or onboarding workflows. Teams that need the full starter experience should use Quickstart.
- **Not a wrapper or lifecycle manager.** There are other wrappers that make the LocalNet lifecycle easier to run via CLI (up/down/restart/status). The composer does not manage lifecycle. It does not wrap `docker compose up`, does not provide `status`, and does not provide logs or snapshots.
- **Not a generic Docker wrapper.** The tool understands Canton's node types, bootstrap configuration, synchronizer topology, and API surface. A generic compose generator would not know how to wire a participant to a sequencer or generate a valid Canton bootstrap script. The Canton-specific knowledge is the value.
- **Not profile migration tooling.** The tool generates fresh output for a selected profile. It does not preserve or transform runtime state across topology changes.
- **Not a web UI or dashboard.** CLI-only. No browser-based management surface.

### 3. Architectural Alignment

The tool builds on cn-quickstart's existing architectural patterns rather than inventing new ones.

**Canton container images.** The generated topologies use the same Canton and Postgres container images that cn-quickstart uses (`${IMAGE_REPO}canton:${IMAGE_TAG}`, `postgres:${POSTGRES_VERSION}`). No custom images are built or maintained. The composer generates different *configurations* for the same images.

**Per-node container layout.** Canton supports running individual node types (participant, sequencer, mediator) from configuration files. The composer generates configurations where each Canton node runs as a separate compose service. This is a standard Canton deployment pattern and is what enables the advanced profiles (HA sequencer, multi-synchronizer, partitioned) that the monolithic LocalNet layout cannot express.

**Compose and environment conventions.** The composer follows cn-quickstart conventions for compose structure, environment variable layering, and role-based port ranges so generated topologies remain familiar and easy to extend.

It does not modify Canton nodes, participant behavior, or the Ledger API. It generates local development configurations — inert files that become a running topology only when the developer runs `docker compose up`.

### 4. Backward Compatibility

*No backward compatibility impact.* This is a new, standalone CLI tool. It generates Docker Compose configurations that use standard Canton images. It does not modify cn-quickstart, LocalNet, or any Canton component. Generated topologies coexist with Quickstart on the same machine (different project directories, different port ranges).

---

## Milestones and Deliverables

### Milestone 1: Generator Core, Minimal and Two-Party Profiles
- **Estimated Delivery:** Week 4
- **Focus:** Define the profile schema and module catalog. Build the deterministic generation pipeline. Deliver the two simple single-synchronizer profiles (`minimal`, `two-party`) that validate the generator end-to-end.
- **Deliverables / Value Metrics:**
  - Profile schema specification (YAML format, versioned, documented)
  - Module catalog with initial modules: `participant`, `sequencer`, `mediator`, `postgres`
  - Canton bootstrap config generator for single-synchronizer topologies
  - Compose file generator that assembles modules into a complete `compose.yaml`
  - Environment file generator following cn-quickstart conventions
  - CLI with `canton-compose generate --profile <name>` command
  - Endpoint map output (JSON) listing all exposed APIs with host/port/protocol
  - `minimal` profile: 1 participant + 1 sequencer + 1 mediator + postgres
  - `two-party` profile: 2 participants + 1 synchronizer + postgres
  - Integration tests: both profiles run successfully with standard Canton images

### Milestone 2: Topology-Lab Profile (Multi-Synchronizer)
- **Estimated Delivery:** Week 7
- **Focus:** Deliver the first advanced profile and prove the core value: a multi-synchronizer topology absent from current starter tooling.
- **Deliverables / Value Metrics:**
  - `topology-lab` profile: 2 participants + 2 synchronizers (2 sequencers + 2 mediators) + postgres
  - Canton bootstrap config generator extended for multi-synchronizer topologies and multi-synchronizer participant wiring
  - `canton-compose list-profiles` and `canton-compose describe <profile>` commands
  - Integration test: generated `topology-lab` topology starts, both synchronizers initialize, and both participants connect to both synchronizers

### Milestone 3: HA-Sequencer and Partitioned Profiles
- **Estimated Delivery:** Week 10
- **Focus:** Deliver the remaining two advanced profiles that cover production-relevant topology patterns.
- **Deliverables / Value Metrics:**
  - `ha-sequencer` profile: 2 participants + 1 synchronizer with 2 sequencer nodes + 1 mediator + postgres
  - `partitioned` profile: 2 participants + 2 synchronizers, each participant connected to only one synchronizer
  - Sequencer module extended with HA index parameterization
  - Integration tests: `ha-sequencer` starts with both sequencers serving one synchronizer; `partitioned` starts with isolated synchronizers and no cross-visibility

### Milestone 4: Documentation, Packaging, Maintenance, and Version Validation
- **Estimated Delivery:** Week 13
- **Focus:** Package the generator for reuse, document when to use each profile, and guarantee long-term version compatibility via a maintenance SLA.
- **Deliverables / Value Metrics:**
  - Prebuilt binaries for Linux (amd64) and macOS (amd64, arm64)
  - Documentation: installation guide, profile reference, worked example for each profile, and Quickstart-vs-Composer positioning guide
  - Version support matrix for the supported Canton release range
  - End-to-end validation on Canton 3.4.x for all five profiles
  - **12-Month Maintenance SLA**: A commitment to provide configuration schema updates and ensure generator compatibility with all minor/patch Canton releases for 12 months following M4 completion

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- Generated compose files for all five profiles reproduce deterministically (same profile + same Canton version = byte-identical output, modulo timestamp)
- All five profiles launch successfully on Canton 3.4.x with Docker Compose and expose the expected Ledger API, Admin API, and sequencer endpoints within 120 seconds
- Behavioral validation: A test Daml script runs against the generated `topology-lab` profile and successfully transfers a contract between the two independent synchronizers
- The generated endpoint map matches the ports and services actually exposed by the generated topology
- `topology-lab` profile successfully runs two independent synchronizers with participants connected to both
- `ha-sequencer` profile successfully runs two sequencer nodes serving a single synchronizer
- `partitioned` profile successfully runs two synchronizers with isolated participant connectivity (no cross-synchronizer visibility)
- Generated Canton bootstrap configurations are valid HOCON and produce the expected node topology when started
- All profiles use standard Canton container images — no custom images are built or required
- Documentation reproduces end-to-end (generate → `docker compose up` → API reachability check → `docker compose down`) on a clean machine with only Docker and the composer binary installed
- Generated output follows cn-quickstart conventions (port numbering, env layering, compose structure) where applicable

---

## Funding

**Total Funding Request:** 140,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Generator Core, Minimal and Two-Party Profiles): 30,000 CC upon committee acceptance
- Milestone 2 (Topology-Lab Profile): 40,000 CC upon committee acceptance
- Milestone 3 (HA-Sequencer and Partitioned Profiles): 40,000 CC upon committee acceptance
- Milestone 4 (Documentation, Packaging, Maintenance, and Version Validation): 30,000 CC upon final release and acceptance

### Volatility Stipulation
The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

The implementing entity operates [Canton Echo](https://x.com/Canton_Echo), an independent community media outlet covering Canton ecosystem news, technical content, and developer tooling. Canton Echo maintains its own audience across X (Twitter) and a Medium blog, and will continue to serve as a long-term channel for Canton developer content beyond this project.

Upon release, we will collaborate with the Foundation on:

- Announcement coordination across Foundation channels and Canton Echo
- Technical blog post on Canton Echo's Medium blog: a worked example covering the `topology-lab` and `ha-sequencer` profiles, showing how they enable local testing of production topology patterns that the default LocalNet bundle cannot express
- Ongoing developer promotion via Canton Echo and Canton community channels

---

## Motivation

Canton applications increasingly have to reason about synchronizer placement, multi-synchronizer transfers, and sequencer availability. Local tooling still assumes one default topology, so teams that need these shapes have to build them by hand.

This is visible in public Canton material today. The official documentation has a dedicated section on multiple synchronizers, and public example repositories such as [davidpadbury-da/canton-multinode-example](https://github.com/davidpadbury-da/canton-multinode-example) show separate-container topologies assembled manually. The problem is real; the missing piece is a maintained generator for repeatable local setups.

---

## Rationale

**Why generation, not lifecycle management.** Existing LocalNet tooling wraps the lifecycle: start, stop, restart, status, logs. The composer solves a different problem — it determines *what* to run, not *how* to run it. The output is plain Docker Compose files. The developer manages the lifecycle with standard Docker Compose commands.

**Why a standalone tool, not a PR to cn-quickstart.** cn-quickstart multiplexes all nodes in a single container with a single bootstrap script. Supporting per-node topologies would require restructuring its container layout and bootstrap flow — a breaking change to the onboarding experience. The composer generates separate-container topologies using the same Canton images but different configurations. If Quickstart later adopts per-node layouts, the composer's generation logic can be contributed upstream.

**Differentiation from existing tooling.** cn-quickstart's module system provides modularity at the *feature* level — adding capabilities to the same topology. The composer provides modularity at the *topology* level — changing which Canton nodes exist and how they are wired. Lifecycle management tools run a fixed topology; the composer generates different topologies. These are different axes with no functional overlap.

**Risks and mitigations.**

- *Canton configuration schema changes.* The composer generates HOCON files that Canton reads at startup. Mitigation: generation is pinned to specific Canton version ranges, golden fixture tests catch schema drift, and this grant includes a funded 12-month maintenance SLA to provide updates for new minor/patch Canton releases.
- *Per-node container startup.* The composer assumes Canton's Docker image can run individual node types from configuration. Mitigation: M1 validates this assumption with the `minimal` profile before investing in later profiles.
- *Native-image packaging friction.* GraalVM native-image can require extra configuration when Java libraries rely on reflection. Mitigation: packaging happens after the generator is working in the JVM build, and Milestone 4 includes binary validation on supported targets.
- *Scope creep toward orchestration.* The tool generates static files and exits. No daemon, no runtime state, no server process.

---

## Future Work

The generation engine can be extended beyond the five curated profiles delivered in this grant:

- **Custom User Profiles:** Opening the CLI to accept user-authored YAML topology definitions (`canton-compose generate --file custom.yaml`), with dynamic port allocation and schema validation for arbitrary participant/synchronizer/sequencer combinations.
- **Kubernetes & Helm Generation:** Translating the profile model into Kubernetes manifests and Helm charts for production deployment.
- **CI/CD Pipeline Artifacts:** Generating ephemeral, headless topology environments for GitHub Actions or GitLab CI integration testing.
- **Live Topology Mutation:** Extending the CLI to mutate running topologies (e.g., severing a participant's sequencer connection, stopping a sequencer node) for resilience testing.

These extensions are out of scope for this grant.
