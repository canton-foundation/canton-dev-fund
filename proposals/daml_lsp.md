## DAML LSP Development Fund Proposal

**Author:** Joshua Pauline
**Status:** Submitted
**Created:** 2026-02-19

---

## Abstract

This proposal seeks funding to build a native Language Server Protocol (LSP) implementation for DAML, the smart contract language used on the Canton Network. Today, DAML developers rely on the Haskell LSP as a partial workaround, which lacks DAML-specific features such as template and choice awareness, contract key validation, and rights-checking diagnostics. A purpose-built DAML LSP will provide first-class editor support including intelligent autocompletion, real-time diagnostics, go-to-definition across DAML modules, and inline documentation, significantly lowering the barrier to entry for Canton smart contract development and improving productivity for existing developers.

---

## Specification

### 1. Objective

DAML shares syntactic roots with Haskell but introduces domain-specific constructs such as templates, choices, contract keys, signatory/observer declarations, and ensure clauses that have no equivalent in standard Haskell. The Haskell LSP can provide basic syntax highlighting and some type-checking, but it cannot:

- Recognize or autocomplete DAML template definitions, choices, or key expressions
- Provide diagnostics specific to DAML's authorization model (signatory, observer, controller)
- Navigate across DAML module boundaries with accurate go-to-definition
- Surface inline documentation for DAML standard library types and functions
- Validate DAML-specific constraints such as contract key uniqueness or ensure clause correctness
- Offer code actions and quick-fixes tailored to common DAML patterns

The objective is to deliver a standalone DAML LSP server that integrates with any LSP-compatible editor (VS Code, Neovim, Emacs, Helix, etc.) and provides a comprehensive, DAML-native development experience.

### 2. Implementation Mechanics

**Core Architecture**

- The LSP server will be implemented as a standalone process that communicates over the standard LSP JSON-RPC protocol
- The server will include a DAML parser and type-checker front-end capable of understanding the full DAML surface syntax, including template blocks, choice definitions, contract keys, and interface implementations
- Incremental parsing and analysis will be used to provide responsive feedback as developers type

**Key Features**

| Feature | Description |
|---|---|
| **Diagnostics** | Real-time error and warning reporting covering DAML type errors, authorization model violations, missing signatory declarations, and malformed template definitions |
| **Autocompletion** | Context-aware suggestions for DAML keywords, template fields, choice names, standard library functions, and imported module symbols |
| **Go-to-Definition** | Cross-module navigation for templates, choices, data types, and functions across a DAML project |
| **Hover Information** | Inline type signatures, documentation, and authorization context for templates, choices, and expressions |
| **Code Actions** | Quick-fixes for common issues such as missing signatory declarations, unused imports, and incomplete pattern matches |
| **Semantic Highlighting** | Token-level highlighting that distinguishes DAML-specific constructs (templates, choices, keys) from general expressions |
| **Workspace Symbols** | Project-wide search for templates, choices, data types, and functions |

**Technology Stack**

- The LSP server will be built using a systems language suitable for performance and cross-platform distribution, My experience is in Rust.
- Tree-sitter or a custom incremental parser for DAML syntax
- LSP protocol handling via an established library (e.g., `tower-lsp` for Rust)
- Editor extension packages for VS Code (primary) and configuration guides for Neovim, Emacs, and Helix

**Development Workflow**

- Open-source from day one under an Apache 2.0 license
- CI/CD pipeline for automated testing, cross-platform builds, and release distribution
- Community feedback incorporated through GitHub issues and discussions

### 3. Architectural Alignment

This proposal directly supports the Canton ecosystem's strategic priority of developer tooling and SDKs, as outlined in the Development Fund's scope. Specifically:

- **Developer onboarding:** A high-quality LSP is table stakes for modern language ecosystems. Without one, Canton risks losing developer adoption to competing smart contract platforms that offer polished IDE experiences
- **Shared infrastructure:** The LSP is a common good usable by every DAML developer on any editor, not tied to a specific application or participant
- **Protocol alignment:** The LSP will be designed to stay current with DAML language evolution and Canton protocol updates, ensuring developers always have accurate tooling for the latest DAML features

### 4. Backward Compatibility

*No backward compatibility impact.* This is a new, standalone tool. Developers currently using the Haskell LSP can continue to do so. The DAML LSP will be an additive improvement that can be adopted independently.

---

## Milestones and Deliverables

### Milestone 1: Parser and Core Infrastructure
- **Estimated Delivery:** Week 4
- **Focus:** DAML parser, project scaffolding, LSP server skeleton, and CI/CD pipeline
- **Deliverables / Value Metrics:**
  - Functional DAML parser covering templates, choices, data types, contract keys, and interfaces
  - LSP server that initializes, connects to editors, and reports basic syntax-level diagnostics
  - Automated test suite with coverage for DAML syntax constructs
  - Public GitHub repository with CI/CD

### Milestone 2: Diagnostics and Navigation
- **Estimated Delivery:** Week 8
- **Focus:** Type-checking integration, DAML-specific diagnostics, and go-to-definition
- **Deliverables / Value Metrics:**
  - Real-time diagnostics for type errors, authorization model violations, and malformed templates
  - Cross-module go-to-definition for templates, choices, data types, and functions
  - Hover information displaying type signatures and documentation
  - VS Code extension published to the marketplace (preview)

### Milestone 3: Autocompletion, Code Actions, and Editor Support
- **Estimated Delivery:** Week 12
- **Focus:** Intelligent autocompletion, code actions, semantic highlighting, and multi-editor support
- **Deliverables / Value Metrics:**
  - Context-aware autocompletion for DAML constructs, standard library, and project symbols
  - Code actions for common quick-fixes (missing signatories, unused imports, etc.)
  - Semantic token highlighting for DAML-specific constructs
  - Workspace symbol search
  - Configuration guides and tested support for Neovim, VS-Code, Emacs, and Helix
  - Stable VS Code extension release
  - Documentation site covering installation, configuration, and feature reference

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- The LSP server must correctly parse and provide diagnostics for all DAML syntax constructs documented in the current DAML language reference
- Go-to-definition must work across multi-module DAML projects
- Autocompletion must include DAML-specific suggestions (template fields, choice names, standard library)
- The VS Code extension must be installable from the marketplace and functional out of the box
- All code must be open-source under Apache 2.0 and hosted in a Canton Foundation-accessible repository

---

## Funding

**Total Funding Request:** 500000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Parser and Core Infrastructure)_: 150000 CC upon committee acceptance
- Milestone 2 _(Diagnosticskand Navigation)_: 150000 CC upon committee acceptance
- Milestone 3 _(Autocompletion, Code Actions, and Editor Support)_: 200000 CC upon final release and acceptance

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone release
- Technical blog post detailing the architecture and capabilities of the DAML LSP
- Developer tutorial demonstrating the LSP in action across multiple editors
- Promotion through Canton developer channels and social media

---

## Motivation

Developer tooling is a critical factor in smart contract platform adoption. Modern developers expect rich IDE support as a baseline, and the absence of a native DAML LSP creates unnecessary friction for both new and experienced Canton developers.

Currently, the closest available option is the Haskell LSP, which provides partial support due to DAML's Haskell-derived syntax. However, it fundamentally cannot understand DAML-specific constructs like templates, choices, contract keys, or the authorization model. This means developers must rely on manual reference lookups, lack real-time feedback on DAML-specific errors, and miss out on productivity features that are standard in other smart contract ecosystems (Solidity, Move, etc.).

A native DAML LSP will:

- **Reduce onboarding time** for new Canton developers by providing immediate, in-editor guidance
- **Increase developer productivity** through intelligent autocompletion, real-time diagnostics, and quick navigation
- **Reduce bugs in production** by surfacing authorization model violations and template errors during development rather than at deployment
- **Strengthen Canton's competitive position** by matching or exceeding the developer experience offered by other smart contract platforms

---

## Rationale

**Why a standalone LSP rather than extending the Haskell LSP?**

The Haskell LSP is designed around Haskell's type system, module system, and build tooling (GHC, Cabal/Stack). DAML diverges from Haskell in fundamental ways: templates are not Haskell type classes, choices are not regular functions, and the authorization model has no Haskell equivalent. Retrofitting DAML support into the Haskell LSP would require invasive modifications to a project with different goals and maintainers, and the result would be a fragile coupling between two diverging languages.

A standalone LSP provides:

- **Full control** over the parser, type-checker, and diagnostics pipeline, enabling accurate DAML-specific analysis
- **Independent release cadence** aligned with DAML language evolution rather than GHC/HLS release cycles
- **Simpler installation** without requiring a full Haskell toolchain
- **Clear maintainability** with a focused codebase and dedicated contributor community

**Why not an editor-specific plugin?**

The LSP protocol is the industry standard for language tooling. Building on LSP ensures compatibility with every major editor and avoids the maintenance burden of separate plugins for VS Code, Neovim, Emacs, and others. The thin editor-specific layers (extensions/configurations) are minimal and easy to maintain.
