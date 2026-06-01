## Development Fund Proposal

**Author:** Askardex
**Status:** Draft
**Created:** 2026-06-01
**Label:** node-deployment-operations
**Champion:** Need Champion

---

# NodePilot: An Open Validator Deployment and Operations Console for Canton

---

## Abstract

Standing up a Canton Network validator today is a manual, error-prone exercise. An operator has to wire together a participant, a Postgres instance, the validator app, an OIDC provider, ingress and TLS, fetch a one-time onboarding secret from a sponsor Super Validator, and get a dozen audience and subject claims exactly right before the node will even register its party on the global synchronizer. Most of that knowledge lives in scattered Helm value files, sample `docker-compose` bundles, and the heads of people who have done it before.

NodePilot is a self-hostable validator server management program that turns this process into a guided, reproducible workflow. It already drives a live Askardex validator on MainNet and supports both deployment paths the ecosystem actually uses: Docker Compose over SSH for single-host operators, and Helm on Kubernetes (tested on k3s) for production setups. This proposal funds the work to harden NodePilot, release it as a maintained public good under a permissive license, and bring it to a state where an independent operator with no prior Canton experience can bring a validator online against DevNet, TestNet, or MainNet without hand-editing configuration.

The source code is published at [github.com/askardex/nodepilot](https://github.com/askardex/nodepilot). The request is for a grant of **1,000,000 Canton Coin (CC)** across three milestones over approximately six months, weighted toward the first milestone where the open-source release and the bulk of the hardening work land. The funding covers engineering, security review, documentation, and a public reference deployment. It does not request ongoing operational subsidy beyond the grant period; maintenance responsibility and its sustainability plan are described below.

---

## Motivation

Validator count is one of the more direct measures of how decentralized the network really is, and onboarding friction is the most common reason a prospective operator stalls before they ever join. The official material (Helm charts, the `splice-node` sample bundle, and written runbooks) is solid, but it assumes the reader can debug Keycloak audience mappers, knows that a brand-new validator with zero amulets will deadlock if `TARGET_TRAFFIC_THROUGHPUT` is left at its default, and understands why topology processing across the sequencer set can make first-time onboarding take far longer than a naive timeout allows. None of that is obvious to a newcomer, and every one of those traps is something we hit and solved while operating our own node.

There is no shared, open tool that packages this operational knowledge into a workflow an operator can follow, so today each team rediscovers the same failure modes on its own. NodePilot already encodes the fixes. Turning it into a common good means the next operators to join inherit that work instead of repeating it. Lowering total cost of ownership for node operators is an explicit ecosystem priority, and validator onboarding is one of the most concrete places to act on it.

We are proposing this because we built the tool out of necessity, it is already in production use for our own infrastructure, and the marginal cost of making it reusable for everyone is small relative to the ecosystem value of more validators coming online cleanly.

---

## Specification

### 1. Objective

Deliver a maintained, open-source validator deployment and operations console that lets an operator:

- bring a Canton validator from a bare host or empty Kubernetes cluster to a registered, healthy node against DevNet, TestNet, or MainNet;
- do so without manually editing Helm values, compose files, or OIDC client configuration;
- manage credentials and identity material safely, with secrets encrypted at rest;
- monitor node and host health and recover from the common first-run failure modes that currently block onboarding.

The intended outcome is a measurable reduction in the time and expertise required to join the network as a validator, validated by independent operators completing onboarding using the tool.

### 2. Implementation Mechanics

NodePilot is a Next.js application (App Router, TypeScript) with a Prisma-backed store, NextAuth session handling, and two execution backends. In Compose mode it drives a remote host over SSH (`ssh2`); in Kubernetes mode it talks to the cluster with a supplied kubeconfig and installs the official Splice Helm charts. The same UI sequences both paths.

The deployment flow it automates today, and which this grant will harden and document:

- **Stack provisioning.** Postgres, the participant, and the validator app are installed in order, with the K8s path pulling the published `splice-validator`, `splice-participant`, and `splice-postgres` charts and the Compose path using the upstream sample bundle. Network parameters (sponsor SV URL, scan address, sequencer URL, migration id) are applied as presets per network.
- **Onboarding.** The one-time onboarding secret is fetched from the sponsor Super Validator and injected only on first start, then cleared once the party is registered so it does not linger in `.env` or a Kubernetes secret. Party hint immutability after first start is enforced to prevent a class of unrecoverable mistakes.
- **Identity and auth.** Optional Keycloak setup creates the realm and the four Splice clients (`validator-backend`, `ledger-api`, `wallet-ui`, `ans-ui`), adds the audience mappers the participant requires, and adds a subject mapper so wallet access can be scoped to a named operator rather than every authenticated user. The operator's wallet identity is bound through `validatorWalletUsers` / `WALLET_ADMIN_USER` so a fresh login does not silently become a privileged wallet user.
- **Exposure.** Ingress, domain, DNS pre-checks, and TLS are configured for the wallet, ANS, and validator API surfaces.
- **Bootstrap safety.** Traffic top-up defaults are set to avoid the well-known cold-start deadlock where a node with no balance cannot purchase the traffic it needs to receive its first faucet.
- **Secrets.** Onboarding secrets, client secrets, and Keycloak credentials are encrypted at rest (AES-256-GCM) rather than stored in plaintext.
- **Operations.** Host metrics (CPU, memory, disk, network), node health, and start/stop controls are surfaced in one place.

The grant work focuses on making each of these reproducible on a clean environment by a third party, closing the gaps between "works on our infrastructure" and "works for any operator," and writing the documentation and tests that let the community trust and extend it.

### 3. Architectural Alignment

NodePilot is an operations layer. It does not modify protocol logic, the synchronizer, or validator internals; it orchestrates the existing, supported deployment artifacts (official Helm charts, the `splice-node` bundle, standard OIDC). It aligns with the network's stated priorities around stability and maintainability, specifically operational simplicity and lower total cost of ownership for node operators, and sits squarely in the `node-deployment-operations` domain. Because it consumes upstream charts and sample configuration rather than forking them, it tracks Splice releases instead of diverging from them.

### 4. Backward Compatibility

No protocol or backward-compatibility impact. NodePilot deploys and manages standard Canton validator components using their supported configuration surfaces. Operators who prefer manual Helm or Compose workflows are unaffected, and a node deployed with NodePilot remains a standard validator that can be operated by hand afterward.

---

## Milestones and Deliverables

### Milestone 1: Public release and reproducible onboarding

- **Estimated Delivery:** ~2 months after approval
- **Focus:** Open-source the codebase under a permissive license, remove any deployment assumptions specific to our own infrastructure, and prove a clean DevNet onboarding from scratch.
- **Deliverables / Value Metrics:**
  - Public repository at [github.com/askardex/nodepilot](https://github.com/askardex/nodepilot) under Apache-2.0 (UI template layer retains its existing MIT attribution), with contribution guidelines and a license audit of dependencies.
  - One documented path that takes an empty host (Compose) and an empty cluster (K8s) to a registered, healthy DevNet validator.
  - Secrets-at-rest encryption verified; no plaintext credentials in the store, logs, or rendered config.
  - Reproducibility evidence: a recorded run plus written steps a reviewer can follow independently.

### Milestone 2: Production Kubernetes path and authenticated wallet

- **Estimated Delivery:** ~2 months after M1
- **Focus:** Bring the Helm/Kubernetes path and OIDC-authenticated operation to production quality, including ingress, TLS, and correctly scoped wallet access.
- **Deliverables / Value Metrics:**
  - Full-stack Helm deployment on a fresh k3s cluster, driven end-to-end from the console: Postgres, then the participant, the validator, Keycloak, and finally ingress.
  - Keycloak setup that produces a working OIDC configuration with audience and subject mappers, with wallet access scoped to a named operator and verified against the "every login is an admin" failure mode.
  - DNS pre-check, domain, and TLS configuration for wallet, ANS, and validator API surfaces.
  - Acceptance evidence: a third party connects their own cluster and reaches a healthy authenticated node.

### Milestone 3: Operability, observability, and operator runbook

- **Estimated Delivery:** ~2 months after M2
- **Focus:** Day-2 operations: monitoring, recovery from common first-run failures, upgrades, and the documentation operators need to run a node unattended.
- **Deliverables / Value Metrics:**
  - Health and host monitoring surfaced in-console, including the bootstrap traffic deadlock guard and clear remediation for the common onboarding stalls (topology delay, audience mismatch, onboarding-secret reuse).
  - A documented validator upgrade flow that tracks Splice releases.
  - Identity backup/restore guidance so an operator can recover a node without losing its party.
  - An operator runbook covering install, onboarding, auth, upgrades, and recovery, written to be usable by someone new to Canton.

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion on the following evidence:

- **M1:** The repository is public under the stated license, free of infrastructure-specific assumptions, and a reviewer can independently reproduce a DevNet validator onboarding from an empty host and an empty cluster using only the published documentation. Secrets are demonstrably encrypted at rest.
- **M2:** A reviewer (or an independent operator) connects their own Kubernetes cluster and completes a full-stack install to a healthy, OIDC-authenticated validator, with wallet access correctly scoped to a single named operator.
- **M3:** Monitoring and recovery features function on a live node; the documented upgrade and identity-recovery procedures are validated; and the operator runbook is complete enough for a newcomer to follow without direct support.

Adoption is the primary success signal. Beyond the deliverables, we will report the number of independent operators who complete onboarding using NodePilot during the grant period and surface their feedback in the pull request thread.

---

## Go-to-Market and Adoption

The users we are targeting are the people for whom validator onboarding is currently a wall: smaller operators, regional infrastructure teams, and newcomers evaluating whether to run a node at all. These are exactly the operators who today read the runbooks, hit one of the failure modes we describe above, and quietly give up. The teams already running fleets of validators have their own automation; our value is highest for the long tail that does not.

Discovery happens where these operators already look. The repository itself is the front door, with a README that gets someone from clone to a running DevNet node, so the tool is useful the moment it is found. Beyond that we will publish a short write-up of the onboarding pitfalls and how NodePilot handles them, which is the kind of practical content operators search for when they are stuck, and we will share it through the Node Deployment & Operations SIG and the Foundation channels. We would also link it from the validator onboarding material where the Foundation finds it appropriate, so it sits next to the official docs rather than competing with them.

What initial adoption looks like, concretely: during the grant we want independent operators, people not affiliated with Askardex, to bring up a validator with the tool and tell us about it in the open. We will treat a handful of confirmed external onboardings during the grant period as the first real signal, with the GitHub issue tracker and the SIG as the place that feedback lands. Because we run our own node on the tool, it stays maintained and current regardless of how fast outside adoption grows, so early users are not betting on an abandoned project.

---

## Funding

**Total Funding Request:** 1,000,000 Canton Coin (CC)

### Payment Breakdown by Milestone

- Milestone 1 (Public release and reproducible onboarding): 450,000 CC upon committee acceptance.
- Milestone 2 (Production Kubernetes path and authenticated wallet): 300,000 CC upon committee acceptance.
- Milestone 3 (Operability, observability, and operator runbook): 250,000 CC upon final release and acceptance.

The first milestone is weighted higher because it front-loads the work with the broadest, most durable benefit to the ecosystem: removing infrastructure-specific assumptions, the open-source release and dependency licensing audit, the secrets-at-rest verification, and the first fully reproducible onboarding path. That work is a prerequisite for everything that follows and delivers a usable public tool on its own.

### Volatility Stipulation

The project is expected to complete within approximately six months, and the grant is denominated in fixed Canton Coin. Should the timeline extend beyond six months due to Committee-requested scope changes, the remaining un-paid milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

On release we are glad to work with the Foundation on an announcement, a technical write-up on validator onboarding pitfalls and how the tool addresses them, and a walkthrough aimed at prospective operators. We can also run a live onboarding session for the community.

---

## Sustainability

Askardex operates its own Canton validator and depends on this tooling for its own node, so we have a standing incentive to keep it working against current Splice releases regardless of the grant. After the grant period we will continue to maintain the public repository, triaging issues, reviewing external contributions, and tracking upstream chart and protocol changes. If the tool reaches broad adoption, we would welcome a conversation about a maintenance arrangement or transfer of governance consistent with how other ecosystem tooling has been handled, but no ongoing subsidy is requested as part of this proposal.

---

## Rationale

We looked at a few cheaper options before settling on this one. Publishing documentation improvements upstream helps, but it does not remove the manual steps or catch the misconfigurations that actually block operators. Releasing our Helm value files and scripts as-is lowers the barrier a little, but still assumes deep familiarity and gives the operator no guard rails. What we chose instead is a guided console that sequences the supported deployment artifacts, encodes the fixes for the known failure modes, and keeps credentials safe. For a new operator the binding constraint is not missing charts; it is knowing how to assemble them correctly the first time.

We deliberately scoped the tool to orchestrate official components rather than fork them. That keeps NodePilot aligned with upstream as the network evolves, and avoids creating a parallel deployment path the Foundation would later have to reconcile. The remaining work is not research. It is the hardening, testing, documentation, and licensing needed to turn a tool that already runs our production node into something the wider ecosystem can rely on.
