# Development Fund Proposal

## Bare Metal Canton Deployment Toolkit

**Author:** GlobalStake  
**Status:** Submitted  
**Created:** 2026-04-08  
**Label:** node-deployment-operations  
**Related CIPs:** CIP-0082 (Development Fund), CIP-0100 (Governance & Review)  
[**Champion**](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md)**:** Rich Domikis, MPCH

---

## Abstract

GlobalStake proposes building and releasing an open-source toolkit that enables any operator to deploy Canton Network Participant, Sequencer, and Mediator nodes directly on bare Linux servers with full systemd service management. The toolkit handles the entire lifecycle: prerequisite installation, source compilation, service file generation, PostgreSQL provisioning, TLS certificate generation, Prometheus/Grafana monitoring integration, and rolling updates. No Docker, no Kubernetes, no container runtime of any kind.

This fills a documented gap in the Canton ecosystem's developer tooling, addresses the operational needs of regulated institutions that require bare metal infrastructure for compliance, and unlocks Canton adoption for organizations where containerized infrastructure is impractical, prohibited, or undesirable.

---

## Specification

### 1\. Objective

Deliver a production-ready, open-source toolkit that provides a complete bare-metal deployment path for Canton Network nodes, eliminating the current requirement to use Docker or Kubernetes. The toolkit covers build automation, installation, service management, configuration, database provisioning, TLS setup, monitoring, and managed upgrades.

A single, focused objective: fill the bare metal deployment gap in Canton's tooling so that regulated institutions and air-gapped environments can adopt Canton without deviation from their compliance requirements.

### 2\. Implementation Mechanics

The toolkit is organized into six functional components:

#### 2.1 Build Automation (`canton-build.sh`)

A shell script that takes a freshly provisioned Linux server from zero to a compiled Canton release bundle:

- Validates the operating system (Ubuntu 24.04 LTS)  
- Installs prerequisites: OpenJDK 21 (default; 17 supported), SBT, git, PostgreSQL client libraries  
- Clones the Canton repository at a specified tag or commit  
- Executes `sbt bundle` to produce the release at `community/app/target/release/canton/`  
- Verifies build output: confirms presence of the fat JAR and `bin/canton` launcher  
- Optionally caches the build artifact as a versioned tarball for multi-node distribution  
- **Supports offline mode** for air-gapped environments: given a pre-built tarball, skips compilation and proceeds directly to installation

#### 2.2 Installation Scripts

**System user and directory layout:** Creates a dedicated `canton` system user and group (no login shell), installs the fat JAR and launcher to `/opt/canton/`, places HOCON configuration files in `/etc/canton/`, creates `/var/log/canton/` and `/var/lib/canton/`.

**PostgreSQL provisioning:** Creates the three databases Canton requires (`canton_participant`, `canton_sequencer`, `canton_mediator`), creates a dedicated PostgreSQL role with UTF-8 encoding, and writes connection environment variables to `/etc/canton/postgres.env`, consumed via HOCON substitution.

**TLS certificate generation:** Wraps Canton's existing `gen-test-certs.sh` to generate a self-signed root CA and certificates for Public API, Ledger API, Admin API, and Admin client. For production, operators replace self-signed certificates with their own CA-signed certificates using the same file paths.

**Pre-flight validation:** Java version check, PostgreSQL connectivity and version check, database encoding verification, port availability, file permissions audit, and TLS certificate validity check.

#### 2.3 systemd Service Files

Three service-unit files that provide full Linux service management for the Canton Participant, Sequencer, and Mediator nodes. Key design decisions drawn from Canton's own patterns:

- `daemon --no-tty` invocation matches the Docker entrypoint exactly  
- `MALLOC_ARENA_MAX=2` per Canton's `entrypoint.sh` recommendation  
- `JDK_JAVA_OPTIONS` with `-XX:+ExitOnOutOfMemoryError -Xmx8G` (Mediator uses `-Xmx1G`)  
- `-XX:+UseG1GC` per Canton's install documentation  
- Structured JSON logs routed to stdout for journald capture  
- Per-component environment files for JVM and runtime overrides  
- `TimeoutStopSec=120` for graceful shutdown; `LimitNOFILE=65536` for gRPC demands

Operators manage nodes with standard Linux commands: `systemctl start`, `systemctl status`, `journalctl -u`, `systemctl enable`.

#### 2.4 Configuration Templates

HOCON configuration files pre-wired for bare metal paths and native PostgreSQL, based on Canton's existing config mixin architecture:

| Component | Key APIs | Ports |
| :---- | :---- | :---- |
| **Participant** | Ledger API (gRPC), Admin API, HTTP Health, HTTP Ledger API | 10001–10005 |
| **Sequencer** | Public API (gRPC), Admin API, Health | 10033–10039 |
| **Mediator** | Admin API, Health | 10042–10044 |

Storage configuration uses Canton's `_shared` mixin pattern with `migrate-and-start = true`. Participant storage tuning uses Canton's connection allocation model, sized for 8–16 core hosts. Templates include TLS integration, JWT authorization templates, and Prometheus metrics configuration.

#### 2.5 Update Script (`canton-update.sh`)

A managed upgrade path handling the full update lifecycle:

1. **Pull** — Fetches latest Canton source at a specified tag  
2. **Build** — Runs `sbt bundle` to produce the new release artifact  
3. **Validate** — Runs pre-flight checks against the new build  
4. **Stop** — Gracefully stops services in dependency order  
5. **Backup** — Creates timestamped backup of current installation  
6. **Swap** — Installs new JAR and launcher  
7. **Migrate** — Verifies database migration completion  
8. **Start** — Restarts services (sequencer, mediator, participant)  
9. **Verify** — Polls health servers until all report healthy

For multi-node HA deployments, the script supports rolling updates: upgrade one replica at a time while the other continues serving traffic.

#### 2.6 Monitoring Integration

- Prometheus scrape configuration targeting bare metal host addresses for Canton, PostgreSQL, and system metrics  
- Grafana dashboards adapted from Canton's repository for BFT ordering, JVM, PostgreSQL, and system metrics  
- Health check integration across gRPC and HTTP endpoints for all three components  
- Optional OpenTelemetry tracing configuration for bare metal Jaeger  
- `monitoring-install.sh` to install Prometheus, Grafana, and postgres-exporter as native systemd services

### 3\. Architectural Alignment

- Uses Canton's own HOCON mixin pattern rather than inventing a new configuration system  
- Calls `bin/canton daemon` exactly as Canton's Docker entrypoint does, with identical flags  
- Uses Canton's standard three-database model with the same PostgreSQL configuration parameters  
- Adapts Canton's existing Prometheus metrics and Grafana dashboards  
- Wraps Canton's existing TLS certificate generation and JWT authorization  
- Fully compatible with all Canton versions that ship the `sbt bundle` release path  
- Directly addresses open work items in Canton's own install documentation: "define hardware and software requirements" and "document how to run Canton from the release bundle"

### 4\. Backward Compatibility

No backward compatibility impact. This toolkit is a standalone deployment aid that operates alongside Canton's existing Docker and Kubernetes methods. It does not modify Canton source code, alter protocol behavior, or require changes to other participants' infrastructure.

---

## Milestones and Deliverables

### Milestone 1: Build Automation & Core Installation

- **Estimated Delivery:** 2 weeks  
- **Focus:** Deliver the foundational build and install pipeline that takes a bare Linux server from zero to a running Canton node.  
- **Deliverables / Value Metrics:** `canton-build.sh`, `canton-install.sh`, `canton-preflight.sh`, `canton-uninstall.sh`, `canton-db-setup.sh`, `INSTALL.md`. Successful end-to-end execution on fresh Ubuntu 24.04 LTS; all scripts tested against Canton's current release tag; documentation covers supported OS, Java, and PostgreSQL version matrix. Toolkit validated internally by GlobalStake's DevOps team on 2 production-equivalent bare metal hosts; onboarding documentation initiated for 3 existing NaaS operator clients interested in Canton bare metal deployment.

### Milestone 2: systemd Service Management & Configuration

- **Estimated Delivery:** 2 weeks  
- **Focus:** Deliver production-grade service management and the full configuration template library.  
- **Deliverables / Value Metrics:** Three systemd unit files with environment file support, full HOCON configuration template set, TLS certificate generation wrapper, `CONFIGURATION.md`. All three Canton node types start, run, and restart via `systemctl`; graceful shutdown completes without data loss; configuration templates produce valid node configurations. At least 1 external operator running a Canton node using the toolkit in a staging environment; outreach initiated to 5 Canton super validators currently running containerized setups.

### Milestone 3: Monitoring Integration & Observability

- **Estimated Delivery:** 2 weeks  
- **Focus:** Deliver the complete bare metal monitoring stack, adapted from Canton's existing containerized observability example.  
- **Deliverables / Value Metrics:** Prometheus scrape config, Grafana dashboards, data source provisioning, `monitoring-install.sh`, optional OpenTelemetry tracing, health check verification. Prometheus scrapes all Canton components; Grafana dashboards render Canton-specific metrics; health endpoints integrate with systemd restart policies. 2 external operators running full bare metal Canton stacks (nodes \+ monitoring); 1 existing GlobalStake NaaS client transitioning to bare metal Canton infrastructure.

### Milestone 4: Upgrade Automation & HA Support

- **Estimated Delivery:** 1 week  
- **Focus:** Deliver the managed upgrade path and support for high-availability deployments.  
- **Deliverables / Value Metrics:** `canton-update.sh`, `canton-backup.sh`, rolling update support for HA deployments, `UPGRADE.md`. Successful version upgrade with zero data loss; backup and restore cycle tested; rolling update demonstrated on a two-node HA configuration. 3 external operators using the toolkit in production or pre-production; at least 1 GlobalStake NaaS client fully transitioned to bare metal Canton deployment.

### Milestone 5: Community Review & Publication

- **Estimated Delivery:** 2 weeks  
- **Focus:** Open the toolkit for community feedback, finalize documentation, and publish the repository.  
- **Deliverables / Value Metrics:** Complete README, community review period on Daml forums, all documentation finalized, repository published under Apache 2.0, announcement post. Community feedback incorporated; deployment validated by at least one external operator; CI pipeline passing all validation scripts.

### Milestone 6: Ongoing Maintenance (12 Months)

- **Estimated Delivery:** Monthly, beginning after Milestone 5 acceptance  
- **Focus:** Keep the toolkit current with Canton releases and support community adoption.  
- **Deliverables / Value Metrics:** Version tracking and testing against each Canton release, community support on issues and forums, errata and corrections, compatibility testing. Toolkit tested within 2 weeks of each Canton release; issues triaged within 5 business days; changelog maintained.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All scripts execute successfully on a fresh Ubuntu 24.04 LTS server, producing running Canton nodes managed by systemd  
- Pre-flight validation catches and reports misconfigured environments before deployment  
- PostgreSQL databases are provisioned with correct encoding, and Canton nodes connect on startup  
- TLS certificates are generated and integrated into node configurations  
- Monitoring stack collects and visualizes Canton metrics without manual configuration  
- Upgrade script successfully migrates between Canton versions with verified health  
- All deliverables are publicly available under the Apache 2.0 license  
- Documentation sufficient for an operator unfamiliar with the toolkit to deploy a Canton node from scratch  
- At least 3 external operators have validated the toolkit in production or pre-production environments by Milestone 4 completion  
- At least 1 existing GlobalStake NaaS client successfully transitioned to bare metal Canton deployment

---

## Funding

**Total Funding Request: $250,000 USD in Canton Coin (CC)**

### Payment Breakdown by Milestone

| Milestone | Target Deadline | Funding (CC) |
| :---- | :---- | :---- |
| M1: Build Automation & Core Installation | 2 weeks | 333,333 CC upon committee acceptance |
| M2: systemd Services & Configuration | 2 weeks | 300,000 CC upon committee acceptance |
| M3: Monitoring & Observability | 2 weeks | 266,667 CC upon committee acceptance |
| M4: Upgrade Automation & HA | 1 week | 200,000 CC upon committee acceptance |
| M5: Community Review & Publication | 2 weeks | 166,667 CC upon committee acceptance |
| M6: Maintenance (12 months) | Monthly | 400,000 CC upon final release and acceptance |
| **Total** |  | **1,666,667 CC** |

### Volatility Stipulation

If the project duration is **under 6 months** (as proposed at 9 weeks):  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility. CC calculations based on 30-day EMA \~0.15.

---

## Co-Marketing

Upon release, GlobalStake will collaborate with the Canton Foundation on:

- A technical blog post detailing the bare metal deployment approach, covering architecture decisions and lessons learned from production operation  
- A developer walkthrough (written or video) demonstrating end-to-end deployment using the toolkit  
- Promotion through GlobalStake's channels (LinkedIn, X, podcast) targeting institutional operators and enterprise infrastructure teams  
- Ongoing visibility through community forum engagement and support for operators adopting the toolkit

---

## Motivation

Canton's deployment tooling today assumes operators run Docker containers or Kubernetes Helm charts. Every published guide, every example configuration, and every monitoring template in the Canton repository is built around containerized infrastructure. There is no supported path for operators who need to run Canton nodes directly on Linux servers.

Canton's participant base includes some of the most heavily regulated institutions in global finance: DTCC, Euroclear, Goldman Sachs, HSBC, BNP Paribas, and Circle, among others.\[1\] These organizations operate under compliance frameworks (SOC 2, PCI DSS, GLBA, SOX, GDPR, DORA) that demand complete audit trails, physical data isolation, and demonstrable security controls at every infrastructure layer.\[2\] Containerized runtimes complicate each of these requirements. Shared kernel namespaces, ephemeral file systems, and multi-tenant orchestration layers introduce variables that auditors routinely flag. FedRAMP's own vulnerability scanning guidance explicitly notes that the ephemeral nature of containers is incompatible with conventional scanning tools used for static infrastructure.\[3\]

The regulatory environment is tightening. The EU's Digital Operational Resilience Act (DORA), in force since January 2025, requires financial entities to demonstrate full control over their ICT infrastructure, including third-party dependencies.\[4\] Bare metal deployment provides the physical isolation, deterministic performance, and clean audit boundaries that satisfy these requirements without the added compliance surface area of container orchestration.\[2\]

For a growing segment of the Canton ecosystem, containers aren't just inconvenient; they're prohibited. Financial institutions, government agencies, and defense contractors operate under policies that restrict or outright ban the use of container runtimes in production, which may mean Canton is losing potential builders without even knowing because this friction kills adoption before demand becomes visible. Air-gapped networks can't pull images from external registries. Organizations with established bare metal provisioning (Ansible, Puppet, Chef) and monitoring infrastructure find that containers bypass rather than integrate with their existing operational stack.

**Ecosystem impact:** GlobalStake already operates Canton validator nodes on dedicated bare metal hardware and fields requests from existing node-as-a-service clients who want to run Canton infrastructure the same way. As the network scales past 575 super validators and over $6 trillion in tokenized real-world assets,\[1\] the operator base will increasingly include institutions whose compliance teams won't approve containerized production workloads. The Canton repository's own install documentation contains open work items noting the need to "define hardware and software requirements" and "document how to run Canton from the release bundle" — confirming this gap is acknowledged upstream. This toolkit removes that blocker before it bottlenecks adoption. We estimate that any operator in a regulated financial, government, or defense environment — likely representing 30–40% of Canton's target institutional participant base — would benefit directly from a supported bare metal path.

---

## Rationale

Three alternatives were considered before settling on this approach:

**Alternative 1: Documentation only.** Publish written guides without shipping working code. Rejected because documentation without tested, executable tooling degrades quickly as Canton releases new versions. Operators would still need to build their own scripts, reproducing the same fragmentation this proposal solves.

**Alternative 2: Ansible/Puppet automation.** Wrap the deployment in a specific configuration management framework. Rejected because it introduces an opinionated dependency. Shell scripts with clear HOCON templates are universally portable and integrate cleanly with any existing provisioning stack an operator already runs.

**Alternative 3: Contribute patches upstream.** Merge directly into the Canton repository. The scope of work — six components, six milestones, 12 months of maintenance — is better delivered as a standalone toolkit with its own release cadence. If the Canton Foundation later prefers to absorb components upstream, the Apache 2.0 license makes that straightforward without requiring renegotiation.

**Chosen approach:** An open-source GitHub repository containing build scripts, installation automation, systemd unit files, HOCON configuration templates, monitoring integrations, and upgrade tooling. Operators clone the repo and run it on their own hardware. This approach extends what exists (Canton's own config patterns, TLS tooling, Prometheus integrations) rather than replacing it, and it is designed to complement Docker and Kubernetes deployments rather than compete with them.

---

## Appendix: Technical Scope Reference

### Supported Environments

| Component | Default | Supported |
| :---- | :---- | :---- |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS (systemd) |
| Java | OpenJDK 21 | 17, 21 (LTS) |
| PostgreSQL | 17 | 14, 15, 16, 17 |
| SBT | Latest | Any (source builds only) |

### Minimum Hardware per Node

| Resource | Specification | Notes |
| :---- | :---- | :---- |
| CPU | 8 cores | Canton docs recommend 4 minimum; 8 provides headroom for JVM \+ PostgreSQL \+ OS |
| RAM | 32 GB | 16 GB JVM heap (participant/sequencer) \+ PostgreSQL shared buffers \+ OS |
| Storage | 250 GB SSD | Growth depends on transaction volume; SSD is required for WAL performance |
| Network | 1 Gbps | Sufficient for gRPC inter-node communication |

### Team

| Name / Role | Background |
| :---- | :---- |
| **Trevor Smith | Web3 DevOps & Architecture** | 10+ years in the U.S. defense and intelligence community including the Department of Defense and NSA, working on mission-critical systems. Transitioned to blockchain infrastructure with a focus on large-scale, global deployments. |
| **Tom Kiblin | Infrastructure, Networking & Security** | Lead architect of GlobalStake's global physical infrastructure with 25 years of mission-critical experience. Former key contributor to Cable & Wireless's global data center footprint; has operated and sold two infrastructure companies to private equity. |
| **Will Roopchan | Infrastructure Operations & Protocol Governance** | 18+ years in software development and DevOps. Responsible for GlobalStake's validator operations. Senior advisor to the Web3 Foundation and Parity Technologies on blockchain governance. |
| **Hasan Al-Aref | Project Management Director** | Two decades delivering complex IT implementations. Experienced managing $30M+ budgets and international project teams across technology and organizational objectives. |
| **Ryan Haczynski | Head of Protocol Partnerships** | Leads protocol partnerships at GlobalStake. Central to GlobalStake's early engagement with Canton's developer relations team. Background in business development, media, education, and strategic communications. |

### Sources

**\[1\]** Canton Network Foundation. Network statistics and participant directory. canton.network (accessed April 2026).

**\[2\]** OpenMetal IaaS. "Blockchain Infrastructure for Regulated Finance: Why Bare Metal Matters for Compliance and Performance." openmetal.io/resources/blog (accessed April 2026). Citing Deloitte analysis of security controls for blockchain applications; covers SOC 2, PCI DSS, MiFID II, and physical isolation requirements.

**\[3\]** FedRAMP. "Vulnerability Scanning Requirements for Containers, Version 1.0." fedramp.gov (accessed April 2026). Notes that ephemeral container environments are incompatible with conventional RA-5 scanning tools used for static infrastructure.

**\[4\]** European Union. Regulation (EU) 2022/2554, Digital Operational Resilience Act (DORA). In force since 17 January 2025\. Requires financial entities to maintain full control and auditability of ICT infrastructure, including third-party dependencies.

**\[5\]** bare-server.com. "Bare Metal Servers in Financial Services: Ensuring Security and Compliance." (accessed April 2026). Covers GLBA, PCI DSS, SOX, and HIPAA requirements for physical hardware isolation in regulated environments.  
