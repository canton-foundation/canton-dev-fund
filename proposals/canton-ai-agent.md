## Development Fund Proposal

**Author:** chris huang
**Status:** Draft
**Created:** 2026-03-08

---

## Abstract

This proposal aims to build the **Canton AI Agent** — an open-source, modular AI assistant designed to automate complex workflows, streamline execution, and optimize the developer and user experience in the Canton ecosystem.

Canton boasts a robust technology stack supported by a vibrant ecosystem. The platform provides a wealth of comprehensive documentation, and the community—especially core contributors and staff on Discord and Slack—are incredibly active and helpful. This proposal does not seek to replace or negate this excellent foundational work. Instead, it aims to complement and elevate the ecosystem by adding an **intelligent execution layer** that transforms comprehensive knowledge into automated, actionable workflows.

Currently, the richness of Canton's advanced features offers tremendous power, and we have an opportunity to further accelerate the journey from idea to running application through automation:

- **Automated User & Wallet Operations**: Enabling the agent to perform everyday user tasks like initiating transfers, receiving funds, managing pre-approvals, setting merge delegations, handling allocation requests, and executing dApp interactions seamlessly.
- **Automated Node Operations**: Simplifying the stand-up of Validator nodes (Kubernetes, KMS, OIDC, ingress) from manual configuration to agent-assisted, step-by-step deployments and active health checks.
- **Interactive API & Contract Workflows**: Providing hands-on, automated interactions for Daml contracts and the Ledger API, allowing the agent to submit commands and query state directly based on guidance.
- **Unified Knowledge Execution**: Seamlessly connecting the dots across official docs, CIP specs, and community insights to provide instant, context-aware code execution and query answers.
- **Streamlined Onboarding**: Guiding developers through Daml's authorization model and multi-node architecture with interactive setups.

The Canton AI Agent builds upon the ecosystem's existing hard work with a **composable architecture** comprising three pillars:

1. **Executable Skills** — versioned, structured workflow modules that encode Canton expertise and step-by-step execution logic across specific domains (e.g., "How to execute a merge delegation operation safely").
2. **MCP (Model Context Protocol) Servers** — live tool integrations that serve as the agent's "hands", allowing it to automatically submit transactions, deploy nodes, interact with the Ledger API, query documentation, and generate boilerplate code.
3. **Persistent Memory** — a growing knowledge graph of ecosystem state and project-specific context.

This approach augments frontier LLMs (GPT, Claude, Gemini, etc.) with Canton-specific context and real-time execution tooling, creating an active operation partner.

---

## Specification

### 1. Objective

Build an open-source Canton AI Agent that serves as an active assistant to execute key developer and user workflows:

| Focus Area | How the Agent Executes & Assists |
|---|---|
| **Wallet & dApp Operations** | The agent executes specific user tasks on instruction: initiating transfers, configuring pre-approvals, setting merge delegations, handling allocation requests, and interacting directly with dApps on the user's behalf. |
| **Node Deployment** | Agent-guided deployment workflows: the node MCP server can execute deployment configurations, verify connectivity, and validate health in real time. |
| **API Interaction** | Skills covering Ledger API (gRPC & JSON) to automatically test command submissions, stream events, manage offsets, and handle typical API logic. |
| **Contract Writing** | Daml MCP server provides syntax validation, template analysis, and generates working code for advanced features. |
| **Knowledge Retrieval** | Unified knowledge interface: skills consolidate information from docs, CIPs, and community knowledge into coherent, queryable guidance. |
| **Ecosystem Onboarding** | Interactive onboarding flows: the agent walks developers through first project setup and automatically generates starter code. |
| **Account Management** | Automated workflows for OIDC provider integration, external party onboarding, JWT-to-party mapping, and user provisioning. |
| **Version Continuity** | Version-tagged skills update with each Canton release; MCP servers query live documentation and validate against current APIs. |

---

### 2. Implementation Mechanics

The project adopts a **modular agent architecture** and will be implemented in three stages.

**The Dual-Engine of Execution: Skills and MCP Servers**
Both Skills and MCP Servers are capable of executing actions, but they operate at different levels of abstraction to provide a complete automation toolkit:
1. **Executable Skills (Agile, Script-Based Execution):** Skills are not just static text—they contain embedded, executable scripts (Bash, Python, cURL, Canton CLI commands) that the agent can run directly. This is perfect for lightweight, highly flexible operations like quickly testing an endpoint, chaining ad-hoc CLI commands, or running bespoke deployment scripts. They provide the agility to automate workflows entirely through prompt-driven scripts.
2. **MCP Servers (Robust, Stateful Execution):** When execution requires persistent state, complex error handling, or strict security boundaries, MCP Servers take over. Instead of the AI struggling to maintain a fragile, long-lived gRPC streaming connection via a shell script, it simply calls the `query_grpc_stream` tool exposed by a robust background service. MCP handles the "heavy lifting" where raw scripts become too brittle.
3. **Synergistic Execution:** When a user asks to "deploy and interact with a node," the agent might first use an embedded **Skill script** to quickly fetch configuration and execute a lightweight `kubectl apply`, and then hand over the transaction signing and continuous event streaming to the **Wallet & Node MCP Server**. This provides the best of both worlds: the agility of script-based skills and the rock-solid stability of dedicated MCP tool servers.

**Stage 1 — Canton Executable Skills Library**

Build a structured, versioned library of Canton execution skills and workflows:

- **Wallet & Ecosystem Skills**: Step-by-step execution flows for initiating wallet transfers, setting pre-approvals, configuring merge delegations, submitting allocation requests, and standard dApp interactions.
- **Validator Node Operations Skills**: Deployment workflows guiding the agent to set up the full stack (Kubernetes, KMS, OIDC, ingress), perform configuration validation, health checks, and execute upgrades.
- **Ledger API Skills**: Actionable patterns for interacting with gRPC and JSON APIs, submitting commands, testing transaction trees, and real-time offset management.
- **Query & Information Skills**: Quick knowledge retrieval for references, deprecation handling, and version-specific guides, preserving the core knowledge base.
- **Daml Contract Skills**: Template patterns, choice design, authorization guards, and automated test generation with Daml Script.
- **Account & Identity Skills**: Workflows for OIDC provider integration, external party management, and multi-tenant provisioning.

Deliverables:
- Canton Skills repository with 10+ core executable skill modules
- Skill authoring guide for community contributors
- Automated skill validation pipeline
- Version-tagged releases aligned with Canton versions

---

**Stage 2 — MCP Tool Integration Layer**

Build MCP (Model Context Protocol) server implementations that give the agent real-time, actionable execution capabilities:

- **Wallet & Transaction MCP Server**: Securely integrates with wallet interfaces to sign and submit transactions, manage pre-approvals, delegations, and handle dApp function calls.
- **Validator Node MCP Server**: Executes deployment configurations (e.g., Kubernetes manifests), queries live node status, verifies connectivity, and checks ledger health.
- **Code Generation & API MCP Server**: Interacts with the Ledger API directly on behalf of the developer, scaffolds Daml templates, and executes quick API tests.
- **Documentation MCP Server**: Real-time search across versioned official docs, CIPs, and structured community knowledge.
- **Daml MCP Server**: Syntax validation, template analysis, dependency checking, and test execution.

Deliverables:
- 5 MCP server implementations (open source)
- MCP integration test suite
- Developer guide for custom MCP server creation
- Verified integration with VS Code, Cursor, and other MCP-compatible tools

---

**Stage 3 — Agent Service & Memory System**

Assemble the full agent with persistent memory and deploy as a multi-channel service:

- **Agent Core**: Orchestration layer that interprets user intent, triggers the corresponding execution skills, operates the MCP tools, and synthesizes results.
- **Memory System**: Persistent knowledge graph tracking ecosystem state and per-user context (node topology, deployed contracts, wallet configuration).
- **Multi-channel Deployment**: Web interface, CLI tool, Slack/Telegram bot, IDE plugin.
- **Continuous Optimization**: Usage patterns help identify opportunities for missing skills and further automation.

Deliverables:
- Canton AI Agent service (web + API)
- CLI developer tool
- Slack and Telegram bot integrations
- Memory system with ecosystem knowledge graph
- Analytics dashboard showing usage patterns and workflow success rates

---

### 3. Architectural Alignment

This project operates entirely at the **tooling and orchestration layer** and does not modify the Canton protocol or node implementations.

- **Respects private key boundaries**: Wallet operations require proper local user approval; the agent orchestrates the workflow but respects secure key-management boundaries.
- **Complements the ecosystem**: Designed to highlight and leverage the excellent existing documentation and community support by surfacing it precisely when needed.
- **Follows Canton versioning**: Skills are version-tagged to match Canton releases.
- **Supports decentralization**: The agent and all MCP servers can be self-hosted; no dependency on centralized infrastructure.
- **Open-source first**: All components are open source, enabling community audit, contribution, and forking.

This project represents **shared infrastructure** that benefits the entire Canton user and developer ecosystem.

---

### 4. Backward Compatibility

No backward compatibility impact. The project is an independent layer of developer and user tooling that interacts seamlessly with existing Canton systems.

---

## Milestones and Deliverables

### Milestone 1: Canton Executable Skills Library

- **Estimated Delivery:** 4 weeks
- **Focus:** Build the foundational skills library covering both execution workflows (wallet, nodes, APIs) and knowledge retrieval.
- **Deliverables / Value Metrics:**
  - 10+ structured skill modules covering core wallet operations, node ops, APIs, contracts, identity, and onboarding.
  - Skill authoring framework and community contribution guide
  - Automated validation pipeline
  - Public repository with version-tagged releases
  - *Detailed Breakdown:*
    1. **Workflow analysis and knowledge mapping**
    2. **Skill module framework development**
    3. **10+ core skill modules creation** (writing, testing, validating)
    4. **Automated validation pipeline** (CI/CD)
    5. **Community contribution guide and tooling**

---

### Milestone 2: MCP Tool Integration Layer

- **Estimated Delivery:** 4 weeks
- **Focus:** Build MCP server implementations for real-time tool execution.
- **Deliverables / Value Metrics:**
  - Wallet & Transaction MCP Server
  - Validator Node MCP Server
  - Code Generation & API MCP Server
  - Documentation MCP Server
  - Daml MCP Server
  - Integration test suite and developer guide
  - *Detailed Breakdown:*
    1. **Wallet & Transaction MCP Server implementation**
    2. **Validator Node MCP Server implementation**
    3. **Code Generation & API MCP Server implementation**
    4. **Documentation & Daml MCP Servers implementation**
    5. **Integration testing and IDE compatibility** (VS Code, Cursor, etc.)

---

### Milestone 3: Agent Service & Memory System

- **Estimated Delivery:** 4 weeks
- **Focus:** Assemble the full agent, deploy as multi-channel service with persistent memory.
- **Deliverables / Value Metrics:**
  - Canton AI Agent web service and API
  - CLI tool for terminal-based interaction
  - Slack and Telegram bot integrations
  - Persistent memory system
  - Usage analytics and feedback collection
  - *Detailed Breakdown:*
    1. **Agent orchestration core development**
    2. **Persistent memory system**
    3. **Multi-channel deployment** (Web, API, CLI, Bots)
    4. **Analytics and feedback system**
    5. **Documentation and maintenance framework**

---

## Acceptance Criteria

Completion will be evaluated based on:

- All milestones delivered as specified
- Agent demonstrates accurate workflow execution and guidance across core focus areas (wallet ops, node ops, contracts, APIs, documentation)
- MCP servers successfully integrate with at least 2 major AI assistants
- Agent accurately handles queries spanning at least 3 Canton versions
- Stable service availability with documented uptime targets
- Complete open-source codebase with documentation
- Community contribution pathway verified (at least 1 external skill contribution)
- Measurable improvement in workflow automation speed (via user feedback survey)

---

## Funding

**Total Funding Request:** 2,100,000 CC

---

### Payment Breakdown by Milestone

- Milestone 1 (Canton Executable Skills Library): 630,000 CC upon committee acceptance
- Milestone 2 (MCP Tool Integration Layer): 840,000 CC upon committee acceptance
- Milestone 3 (Agent Service & Memory System): 630,000 CC upon final release and acceptance

---

### Volatility Stipulation

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

The project is expected to be completed within 3 months.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation to highlight how the agent complements the ecosystem.

Planned activities include:

- Coordinated announcement with the Canton Foundation upon initial release
- Technical blog post describing the agent's executable architecture and how it leverages the community's extensive knowledge base
- Interactive tutorial series demonstrating practical usage: from automated wallet transfers to node deployment execution
- Live demonstration of autonomous agent workflows at developer events
- Open invitation for community skill contributions

The project will provide:

- **Open-source MCP servers** that can be integrated into any compatible AI assistant, bringing execution capabilities to existing tools
- **Slack and Telegram bots** enabling execution workflows directly in community channels
- **Public skill contribution framework** encouraging shared automation

---

## Motivation

Canton is incredibly feature-rich and is supported by a highly responsive community and comprehensive documentation. As the platform's footprint grows, this richness creates a fantastic opportunity to further streamline the user and developer experience through automation.

**Elevating from Search to Execution:** The community has already done the hard work of documenting APIs, detailing node architectures, and solving common edge cases. The Canton AI Agent takes this a step further by bridging the gap between "knowing what to do" and "doing it." Instead of just reading a guide on how to perform a merge delegation or deploy a node, the agent executes the workflow directly on the user's behalf.

**Streamlining Repetitive Workflows:** Everyday tasks like managing wallet pre-approvals, interacting with the Ledger API, or executing multi-step deployment configurations are powerful but can be repetitive. A dedicated agent can automate these robust patterns, freeing users and developers to focus on higher-level logic.

**Amplifying Contributor Efforts:** The Canton core team and community contributors provide world-class support on Slack and Discord. By equipping an AI agent with executable skills for the most common operations and inquiries, we can handle routine executions and fast-track onboarding, allowing core contributors to focus on complex protocol engineering and platform growth.

The Canton AI Agent serves as a respectful amplifier for the ecosystem. It takes the platform’s exceptional foundational knowledge and turns it into interactive, executable assistance that further lowers the barrier to entry and accelerates time-to-production.

---

## Rationale

As a Canton builder, my journey has been made possible by the wealth of documentation and the incredible support from the Canton team. Setting up my first Validator node, writing Daml contracts, and managing wallet interactions were achieved thanks to the excellent resources in the community. However, these experiences highlighted an exciting opportunity: what if we could package these reliable solutions into executable automation?

These experiences directly shaped this proposal:

1. **Executable Automation over Static Guides**: While docs are vital, having an agent act as your "hands" to execute a transfer, test an API, or deploy a node radically shrinks the time from intent to result.
2. **Flexible Execution Engine**: By supporting both agile script execution natively within Skills and robust, typed tool execution via MCP Servers, the agent can adapt to the complexity of the task. Need a quick config change? A shell script in a Skill handles it instantly. Need to securely sign a transaction and stream ledger events? The MCP server provides the stateful stability required.
3. **Complete Out-of-the-Box Workflows**: In this architecture, **Skills** define the high-level workflow ("Here is how you safely execute a token transfer and handle errors") and often execute the lightweight steps themselves, while the **MCP Servers** are seamlessly invoked for the specialized, heavy-lifting operations. They are a necessary, synergistic pairing.
4. **Celebrating the Ecosystem**: The most sophisticated AI still needs a ground truth. Canton's excellent docs, active community channels, and robust protocol design form the perfect foundation for an AI orchestration layer.

This architecture brings the Canton experience into the era of agentic automation: transitioning from a world where developers read and type, to one where they instruct and the agent executes.
