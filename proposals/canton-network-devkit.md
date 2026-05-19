## **Development Fund Proposal**

**Author:** Moonsong Labs
**Status:** Submitted
**Created:** 2026-03-19
**Updated**: 2026-05-04
**Label:** daml-tooling
**Champion:** Curtis Hrischuk

---

## Abstract

DevKit proposes targeted extensions to Digital Asset’s `dpm` CLI to improve Daml package resolution and transaction debugging for Canton application developers.

The proposal introduces a packaged `dpm trace` component for inspecting ledger transactions and producing machine-readable outputs for tooling and AI-assisted debugging. It also adds upstream `dpm` enhancements for resolving Daml dependencies from explicit Git-based package sources. 

The result is a more repeatable developer workflow that reduces manual `.dar` handling and gives developers clearer tools for diagnosing transaction behavior without introducing a separate application CLI or orchestration layer.

---

## Specification

### 1. Objective

The problem this proposal solves is repeated friction in Canton/Daml application development caused by manual `.dar` handling and limited transaction inspection workflows.

Today, developers often rely on ad hoc scripts to fetch dependency DARs and keep dependency setup consistent across local and CI workflows. When workflows fail or behave unexpectedly, teams also lack a convenient `dpm`-native way to inspect committed ledger activity, understand visible transaction trees, and combine trace output with available completion or error metadata for debugging or AI-assisted analysis.

The intended outcome is a focused set of DevKit extensions for `dpm` that improves two related workflows:

- resolving Daml dependencies from explicit Git repositories, with more repeatable local/CI behavior
- inspecting ledger transactions through a `dpm trace` component, with human-readable and machine-readable outputs that help developers and AI agents debug Daml workflows

**Target users**

- Canton application developers building Daml workflows and services
- platform engineers maintaining local and CI workflows for Daml projects
- ecosystem maintainers publishing reusable Daml packages or examples
- developers using AI agents to inspect, explain, or debug Canton/Daml workflows

### 2. Implementation Mechanics

`dpm` supports extensibility through project-declared components in `daml.yaml` and `multi-package.yaml`. DevKit uses that model for the trace component, while resorting to direct upstream `dpm` changes for Git-based dependency support.

The implementation is organized around two technical workstreams: a packaged `dpm trace` component and targeted upstream enhancements to Daml dependency resolution.

#### **`dpm trace` component**

This component adds trace-oriented commands to the `dpm` CLI, and will be packaged for use through the existing `dpm` component mechanism by declaring it in a project’s `daml.yaml` or `multi-package.yaml`.

Example configuration:

```yaml
components:
  - name: trace
    path: ./devkit-components/trace
```

After adding the component to project configuration, the developer installs the declared components by running `dpm install package` from the project directory. The component will include `component.yaml`, supported platform binaries, and any additional files required for project-level use through the dpm component mechanism.

Milestone 1 will document the supported `dpm` / SDK versions and project configuration requirements for adding the component to an existing Daml project.

**The initial command surface will include:**

- `dpm trace <tx-id>`: inspect a visible transaction by identifier and render a human-readable transaction tree. This is intended to give developers a CLI view similar in spirit to the transaction tree shown when running Daml scripts, although the exact output format will be finalized during implementation.
- `dpm trace watch`: watch newly committed visible transactions from the configured participant connection and render trace output as transactions arrive. The initial implementation may start with unfiltered visible transaction output, with filtering added where supported by the underlying APIs.
- `dpm trace --cmd <cmd-name>`: inspect or filter transactions associated with a command or choice where the connected participant’s Ledger API or PQS capabilities support this lookup. If direct historical lookup is not available, this may be delivered as a filter over watched or otherwise retrieved transaction data.

Trace output will be available in both human-readable and machine-readable formats. JSON output will support CI, tooling, and AI-agent workflows, and may be paired with `--out-file <path>` to persist results.

Additional flags may include `--host`, `--ledger-api-port`, and `--pqs-port` for connecting to local or external participant nodes, defaulting to a local sandbox-style connection where appropriate. For non-local participants, the implementation will document supported connection and authentication configuration, including any visibility or filtering constraints exposed by the available APIs.

The implementation will use the Ledger API of the configured participant node. Where historical command or choice lookup requires richer indexing, the implementation will investigate PQS support and use it where available. In all cases, results are limited by the configured participant connection, authentication, party visibility, available APIs, and retention/pruning configuration.

Full illustrative examples of the intended developer experience are included in the appendix.

#### **Git-based Daml dependency resolution**

Today, Daml projects can depend on SDK-provided packages such as `daml-prim`, `daml-stdlib`, and `daml-script`, as well as local DAR files through `data-dependencies`. When projects depend on external DARs, teams often handle fetching and wiring those files through manual steps or project-specific scripts.

DevKit adds support for resolving Daml dependencies from explicit Git-based package sources, so those external DAR sources can become part of the `dpm` project workflow. 

Example current pattern:

```yaml
dependencies:
  - daml-prim
  - daml-stdlib
  - daml-script
data-dependencies:
  - ../loyalty/.daml/dist/loyalty-1.0.0.dar
```

The proposed extension would allow project configuration to reference a Git repository containing dependency DARs, using a branch, tag, or commit reference where appropriate.

Example:

```yaml
dependencies:
  - daml-prim
  - daml-stdlib
  - daml-script
  - git:https://github.com/example-org/example-repo.git#main
```

This reduces manual `.dar` handling by making explicit Git sources part of the `dpm` project workflow. The implementation will define the supported Git dependency contract, including expected repository layout, whether subdirectories are supported, and how mutable references such as branches are resolved or pinned for repeatable local and CI usage.

> `⚠️ IMPORTANT` : Supporting this feature requires a direct contribution to the `dpm` codebase and coordination with the Daml team
> 

#### **AI-agent support**

DevKit will include agent skill documents that explain how AI assistants should use the new trace commands for debugging Daml workflows. These will be plain-text guidance files intended for inclusion in a project’s `.agents/` folder.

The initial skill set is expected to cover the following workflows, although the final organization and naming of the skill files may differ:

- `trace-explain`: explain a transaction trace in terms of the Daml workflow
- `failure-debug`: use trace output, available completion/error metadata, and project source to identify likely failure causes
- `sentinel`: use watch-style trace output to monitor repeated failures and summarize patterns

The AI layer does not perform signing, transaction submission, or key management. It operates over deterministic CLI outputs and project files available to the developer.

Trace outputs may include contract payloads, party identifiers, and other application data visible to the configured participant. Documentation will make this explicit and recommend that developers review trace output before sharing it with external AI tools. Where feasible, the implementation may support redaction or field filtering for human-readable or JSON output.

#### **Support materials**

The delivery will include documentation covering installation, configuration, command usage, JSON output examples, and recommended local/CI usage patterns. Where useful, the work will also include a small reference project or workflow example showing how to install the component, run trace commands, and use Git-based Daml dependencies in a repeatable setup.

### 3. Architectural Alignment

This proposal aligns with Canton ecosystem priorities by extending existing `dpm` capabilities rather than introducing a separate application CLI or orchestration layer. It focuses on improving the developer experience where `dpm` is already the natural entry point: Daml package dependency configuration and transaction-level inspection.

Architecturally, DevKit follows Canton’s participant-scoped model. The trace component uses participant-facing APIs, such as the Ledger API and, where useful and available, PQS, and its outputs are limited by the configured participant connection, authentication, party visibility, and retention/pruning configuration. This aligns with Canton’s privacy model rather than attempting to create a global transaction view.

The result is a dpm-native extension path that avoids protocol changes, new node infrastructure, and a network-wide package registry.

### 4. Backward Compatibility

*No backward compatibility impact.*

DevKit is additive. The `dpm trace` functionality is delivered as a packaged component, and Git-based dependency support is intended as an extension to existing `dpm` project configuration rather than a replacement for current dependency patterns. Existing `daml.yaml`, `multi-package.yaml`, SDK-based workflows, local DAR dependencies, and standard `dpm` commands continue to work as they do today.

---

## Milestones and Deliverables

### **Milestone 1: `dpm trace` Component MVP**

- **Estimated Delivery:** Week 4
- **Focus:** Deliver a `dpm` component for basic transaction inspection from a configured participant connection.
- **Deliverables / Value Metrics:**
    - `dpm trace` component packaged according to the existing `dpm` component model, including `component.yaml` and supported platform binaries
    - `dpm trace <tx-id>` command for inspecting a visible transaction from a configured participant connection, with the supported input reference documented as part of the implementation
    - human-readable transaction tree output based on available Ledger API data
    - `--json` output mode and optional `--out-file` support for CI and AI-agent workflows
    - connection flags for local or external participant endpoints, such as `--host` and `--ledger-api-port`
    - reference workflow showing that a developer can install the component and inspect a visible transaction without custom scripts

### **Milestone 2: Trace Watch, Filtering, and Git-Based Dependencies**

- **Estimated Delivery:** Week 8
- **Focus:** Expand trace workflows and deliver explicit-source Daml dependency resolution through `dpm`.
- **Deliverables / Value Metrics:**
    - `dpm trace watch` command for streaming newly committed visible transactions from a configured participant connection
    - watch output scoped to the configured participant connection, including authentication, party visibility, offset handling, and retention/pruning limits
    - command or choice filtering for trace workflows where supported by the connected participant’s Ledger API or PQS capabilities
    - improved JSON output structure for trace and watch workflows, suitable for CI and AI-agent consumption
    - upstream `dpm` PR or agreed contribution path for resolving dependency DARs from explicit Git-based sources, with `daml.yaml` support and `multi-package.yaml` behavior documented where applicable
    - support for Git references such as branch, tag, or commit hash where feasible

### **Milestone 3: Agent Skills and Hardening**

- **Estimated Delivery:** Week 12
- **Focus:** Harden the trace and Git dependency workflows and provide lightweight AI-agent guidance for debugging.
- **Deliverables / Value Metrics:**
    - `.agents/` skill files explaining how AI assistants should use `dpm trace` outputs to inspect and debug Daml workflows
    - initial skill documents for trace explanation, failure debugging, and watch-based failure monitoring
    - hardening of trace output formatting, JSON schema stability, error handling, and participant connection behavior
    - hardening of the Git-based dependency workflow, including documented behavior for branch, tag, and commit references where supported
    - documentation clarifying that AI-agent support is advisory only, operates over deterministic CLI outputs and local project files, and does not include signing, transaction submission, key management, custody, or autonomous execution
    - documentation covering component installation, trace commands, JSON output, Git dependency configuration, and AI-agent usage
    - documented examples showing a project resolving dependency DARs from explicit Git sources instead of manual `.dar` download scripts
    - local/CI workflow example demonstrating repeatable dependency resolution from declared Git sources
    - reference project demonstrating Git-based dependency resolution plus trace-based debugging

### **Milestone 4: Ecosystem Validation and Enablement**

- **Estimated Delivery:** Week 16
- **Focus:** Validate the completed DevKit workflows with ecosystem developers and publish lightweight adoption materials.
- **Deliverables / Value Metrics:**
    - validation with at least two external or ecosystem developers who can complete the reference workflow and provide feedback
    - review validation feedback and document any remaining issues or follow-up items before project completion
    - 1 recorded demo or walkthrough showing the completed workflow: install the `dpm trace` component, inspect a visible transaction, produce JSON output, use AI-agent guidance, and resolve a Daml dependency from an explicit Git source
    - 1 short technical writeup or case study explaining the DevKit workflow and its value for Canton/Daml developers
    - host “office hours” sessions for pilot teams and ecosystem developers; to be designed as 1-hour sessions held each week for 4 weeks

### Post-Completion: Ongoing Maintenance

Given the role of DevKit as shared developer tooling, we expect maintenance to become important as the Canton ecosystem evolves. Although ongoing maintenance is not in scope for this proposal, Moonsong Labs would be available to provide ongoing maintenance and would recommend revisiting this as a separate agreement should there be a clear demonstration of adoption by the ecosystem per Milestone 4.

---

## Acceptance Criteria

 Project-specific acceptance conditions:

- developers can manually add the `dpm trace` component through the existing `dpm` component mechanism and run it from a Daml project without custom scripts
- developers can inspect a visible transaction from a configured participant connection and receive a readable transaction tree
- developers can produce JSON trace output suitable for CI or AI-agent workflows
- developers can use `dpm trace watch` to observe newly committed visible transactions from a configured participant connection
- command/choice filtering is delivered where supported by available Ledger API or PQS capabilities, or the implementation clearly documents fallback behavior and limits
- developers can reference explicit Git-based Daml dependency sources in project configuration and resolve them in a repeatable local/CI workflow
- `.agents/` skill files for trace explanation, failure debugging, and watch-based monitoring are delivered and documented against the reference project
- feedback from validation, demo, and office-hours sessions is triaged into documented issues, follow-up tasks, or documentation updates before final completion
- at least two external or ecosystem developers complete the walkthrough from the published documentation

---

## Funding

**Total Funding Request:** 1,575,000 CC

### Payment Breakdown by Milestone

- Milestone 1 dpm trace Component MVP: 450,000 CC upon committee acceptance
- Milestone 2 Trace Watch, Filtering, and Git-Based Dependencies: 450,000 CC upon committee acceptance
- Milestone 3 Agent Skills and Hardening: 450,000 CC upon committee acceptance
- Milestone 4 Ecosystem Validation and Enablement: 225,000 CC upon final release and acceptance

---

## **Volatility Stipulation**

The project timeline is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Co-marketing will be aligned with Milestone 4 and focused on helping Canton/Daml developers understand and evaluate the completed DevKit workflows.

Specific commitments for this proposal:

- coordinate with the Canton Foundation on announcement timing for the completed DevKit release
- jointly promote the recorded demo or walkthrough produced in Milestone 4
- jointly promote the technical writeup or case study covering the `dpm trace` and Git dependency workflows
- coordinate distribution of the reference workflow and documentation through appropriate Moonsong Labs, Canton Foundation, and ecosystem channels
- co-marketing of the weekly office hours sessions to drive ecosystem participation and engagement
- support one live walkthrough for interested ecosystem developers, coordinated with the Canton Foundation

---

## Motivation

Canton/Daml developers still spend avoidable time on project-level glue work: manually wiring external DARs into projects, keeping dependency setup consistent across local and CI workflows, and inspecting transaction behavior when Daml workflows fail or behave unexpectedly. These tasks are common across application teams, but today they are often handled through ad hoc scripts, manual inspection, or project-specific conventions.

DevKit addresses this by improving the existing `dpm` workflow where developers already build, test, and manage Daml projects. This follows the preferred ecosystem pattern of extending existing tooling.

Teams building non-trivial applications, especially those using external dependencies, CI, or multi-party workflows, would benefit in several practical ways:

- fewer manual `.dar` handling steps through explicit Git-based dependency sources
- more consistent local and CI setup for projects using external Daml packages
- faster inspection of transaction behavior through readable trace output
- better automation support through JSON trace output for CI and AI-agent workflows
- less duplicated scripting around dependency setup and transaction inspection

---

## Rationale

This approach is well suited to the problem because it improves Canton/Daml development by extending the tool developers already use: `dpm`. DevKit strengthens the existing `dpm` workflow in two focused areas where teams currently rely on manual work: explicit-source Daml dependency resolution and transaction-level debugging.

The design fits the current Canton tooling stack by keeping lower-level developer workflow capabilities inside or alongside `dpm`, rather than creating a parallel application platform. The `dpm trace` component can be installed through the existing `dpm` component mechanism, while Git-based dependency resolution can be pursued as a targeted upstream contribution to `dpm`.

This keeps the work useful as shared developer tooling while keeping adoption incremental and milestone review straightforward.

---

## Addendum

### **1. Illustrative `dpm trace` Output**

The following examples illustrate the intended developer experience for the `dpm trace` command family. The exact command syntax, accepted transaction identifiers, field names, and output formatting will be finalized during implementation based on available Ledger API and PQS capabilities.

The examples are not intended to define a stable output schema. Stable machine-readable output will be provided through JSON mode.

### **Example 1: Inspect a transaction by ID**

`dpm trace <tx-id>`: Inspect a transaction by its identifier. This can be thought of as similar to the transaction tree view produced when running a Daml script using the Daml VS Code extension.

This example shows a developer inspecting a visible transaction and receiving a readable transaction tree, including the exercise node, disclosed parties, choice arguments, and child create event.

```
TX 3 1970-01-01T00:00:00Z (AirlineLoyaltyTest:291:35)
#3:0
│   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
└─> 'Customer-d4d95138' exercises SubmitApplication on #1:1 (AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e)
                        with
                          submittedDetails =
                            (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                               customerId = "alice-query-001";
                               fullName = "Alice";
                               address = "1 Aviation Way";
                               email = "alice@example.com";
                               phone = some "+44 7000 000001";
                               timestamp = 1970-01-01T00:00:00Z;
                               dob = 1990-01-01T)
    children:
    #3:1
    │   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
    └─> 'Customer-d4d95138' creates AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e
                            with
                              airline = 'Airline-9b3970be';
                              customer = 'Customer-d4d95138';
                              details =
                                some (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                                        customerId = "alice-query-001";
                                        fullName = "Alice";
                                        address = "1 Aviation Way";
                                        email = "alice@example.com";
                                        phone = some "+44 7000 000001";
                                        timestamp = 1970-01-01T00:00:00Z;
                                        dob = 1990-01-01T)
```

### **Example 2: Watch newly committed visible transactions**

`dpm trace watch`: Similar to `dpm trace <tx-id>`, but instead of inspecting a single transaction, it will watch the ledger for new transactions and inspect them as they are committed. The initial implementation may start with unfiltered visible transactions, with filtering added where supported.

This example shows the watch mode rendering newly committed visible transactions as they arrive from the configured participant connection.

```
👀 Watching for new transactions... (Press Ctrl+C to stop)
--------------------------------
TX 3 1970-01-01T00:00:00Z (AirlineLoyaltyTest:291:35)
#3:0
│   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
└─> 'Customer-d4d95138' exercises SubmitApplication on #1:1 (AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e)
                        with
                          submittedDetails =
                            (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                               customerId = "alice-query-001";
                               fullName = "Alice";
                               address = "1 Aviation Way";
                               email = "alice@example.com";
                               phone = some "+44 7000 000001";
                               timestamp = 1970-01-01T00:00:00Z;
                               dob = 1990-01-01T)
    children:
    #3:1
    │   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
    └─> 'Customer-d4d95138' creates AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e
                            with
                              airline = 'Airline-9b3970be';
                              customer = 'Customer-d4d95138';
                              details =
                                some (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                                        customerId = "alice-query-001";
                                        fullName = "Alice";
                                        address = "1 Aviation Way";
                                        email = "alice@example.com";
                                        phone = some "+44 7000 000001";
                                        timestamp = 1970-01-01T00:00:00Z;
                                        dob = 1990-01-01T)
```

### **Example 3: Filter by command or choice where supported**

`dpm trace --cmd <cmd-name>`: inspects or filters transactions associated with a command or choice where supported by the connected participant’s Ledger API or PQS capabilities.

This example shows command or choice-based filtering. Historical lookup depends on the connected participant’s Ledger API / PQS capabilities. Where direct lookup is not available, this workflow may be implemented as filtering over watched or retrieved transaction data.

```
TX 3 1970-01-01T00:00:00Z (AirlineLoyaltyTest:291:35)
#3:0
│   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
└─> 'Customer-d4d95138' exercises SubmitApplication on #1:1 (AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e)
                        with
                          submittedDetails =
                            (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                               customerId = "alice-query-001";
                               fullName = "Alice";
                               address = "1 Aviation Way";
                               email = "alice@example.com";
                               phone = some "+44 7000 000001";
                               timestamp = 1970-01-01T00:00:00Z;
                               dob = 1990-01-01T)
    children:
    #3:1
    │   disclosed to (since): 'Airline-9b3970be' (3), 'Customer-d4d95138' (3)
    └─> 'Customer-d4d95138' creates AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e
                            with
                              airline = 'Airline-9b3970be';
                              customer = 'Customer-d4d95138';
                              details =
                                some (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                                        customerId = "alice-query-001";
                                        fullName = "Alice";
                                        address = "1 Aviation Way";
                                        email = "alice@example.com";
                                        phone = some "+44 7000 000001";
                                        timestamp = 1970-01-01T00:00:00Z;
                                        dob = 1990-01-01T)

TX 4 1970-01-01T00:00:00Z (AirlineLoyaltyTest:295:33)
#4:0
│   disclosed to (since): 'Airline-9b3970be' (4), 'Customer-d4d95138' (4)
└─> 'Customer-d4d95138' exercises SubmitApplication on #2:1 (AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e)
                        with
                          submittedDetails =
                            (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                               customerId = "bob-query-001";
                               fullName = "Bob";
                               address = "2 Runway Road";
                               email = "bob@example.com";
                               phone = some "+44 7000 000002";
                               timestamp = 1970-01-01T00:00:00Z;
                               dob = 1988-02-02T)
    children:
    #4:1
    │   disclosed to (since): 'Airline-9b3970be' (4), 'Customer-d4d95138' (4)
    └─> 'Customer-d4d95138' creates AirlineLoyalty:CLPApplication@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e
                            with
                              airline = 'Airline-9b3970be';
                              customer = 'Customer-d4d95138';
                              details =
                                some (AirlineLoyalty:ApplicationDetails@0016a6a55d99171dc85011b8e8bd7a945d931e75c089d586ead6d706d31ae97e with
                                        customerId = "bob-query-001";
                                        fullName = "Bob";
                                        address = "2 Runway Road";
                                        email = "bob@example.com";
                                        phone = some "+44 7000 000002";
                                        timestamp = 1970-01-01T00:00:00Z;
                                        dob = 1988-02-02T)
```

### **2. Why Moonsong Labs**

Moonsong Labs engineers have shipped production systems across Polkadot, Ethereum, zkSync, Solana, and other ecosystems. This includes developer tooling, chain infrastructure, and operational automation used by external teams.

Work directly relevant to this package includes:

- Canton Network demo application, compliant stablecoin plus yield vault, used to validate Daml Finance composition patterns and Canton privacy. The work included a devcontainer for one-click setup, plus AI skills that generate TypeScript SDKs from Daml models and scaffold React UI components
    
    Case study: https://moonsonglabs.com/casestudy/demonstrating-a-baseline-for-building-advanced-financial-applications-on-canton/
    
    Repo: https://github.com/Moonsong-Labs/canton-apps
    
- ZKsyncOS Foundry and related developer tooling, Rust-based tooling derived from the Foundry stack to support Ethereum development workflows on ZKsyncOS, plus testing utilities for Foundry ZKsync
    
    https://github.com/Moonsong-Labs/zksync-os-foundry
    
    https://github.com/Moonsong-Labs/forge-zksync-std
    
- Moonbeam and Moonkit, production chain engineering paired with reusable developer utilities and operational tooling.
    
    https://github.com/Moonsong-Labs/moonbeam-tools
    
    https://github.com/Moonsong-Labs/moonkit
    
- DataHaven and StorageHub, multi-component systems with reproducible builds and automation across chains and services.
    
    https://github.com/datahaven-xyz/datahaven
    
    https://github.com/Moonsong-Labs/storage-hub
    

These projects reflect a consistent pattern, building developer-facing tooling that reduces setup friction while keeping security boundaries explicit. This experience aligns with Canton’s current DevEx needs and supports delivery of dpm-native tooling that teams can adopt incrementally.