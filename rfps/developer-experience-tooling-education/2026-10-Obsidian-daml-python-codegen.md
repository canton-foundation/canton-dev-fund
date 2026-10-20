# Python Code Generation for Daml Packages

## Development Fund Proposal

**Organization:** Obsidian Systems  
**Author / Primary Contact:** Frank Gruber, Obsidian Systems, frank.gruber@obsidian.systems  
**Status:** Submitted  
**Created:** 2026-10-16  
**Proposal Type:** RFP-aligned proposal  
**RFP / Roadmap Area:** Developer Experience, Tooling & Education: RFP #17, SDKs in different languages (standard)  
**Champion:** `Needs Champion`  
**Total Funding Request:** 1,270,000 CC  
**Project Duration:** 15 months. Delivery by month 3, adoption to month 12, maintenance for 12 months after delivery.  
**Label:** daml-tooling  

---

## Abstract

Canton does not ship a Python code generator, so Python teams on dazl-client hand-write classes for every Daml package. Obsidian Systems will build an Apache 2.0 generator that turns a compiled Daml package (DAR) into Python classes for its templates and data types, and will maintain it for a year. The classes convert to dazl-client submissions and parse Daml JSON, including PQS results.

## Specification

### 1. Objective

Python developers generate typed classes from a DAR instead of writing them by hand. The generator emits types and converters only, not Daml logic.

### 2. Implementation Mechanics

The generator emits Python classes for the templates, records, variants and enums in a DAR's Daml-LF. The classes convert values to dazl-client's submission format and parse Daml JSON, including PQS rows.

dazl-client already parses Daml-LF for Daml 3.3.0 and later through its Python v3 support (dazl-client [PR #541](https://github.com/digital-asset/dazl-client/pull/541)). The Noders grant "Go SDKs and Python DAZL Contributions for Canton" funded that work ([PR #38](https://github.com/canton-foundation/canton-dev-fund/pull/38)). Milestone 1 determines whether the generator reuses that parser.

The generator maps Daml packages to Python classes. Clients exchange only plain data with the ledger. The generator skips types that hold functions. Python rejects Daml names such as `x'`. A documented scheme escapes and restores them. Daml modules do not map directly onto Python modules. Obsidian documents the module mapping at the start of Milestone 1.

Tests round-trip values through a local Canton ledger. Obsidian publishes each release on PyPI.

### 3. Architectural Alignment

The generator serves Python teams that submit through dazl-client or read from PQS. It covers the Daml representation, JSON Codec and PQS bindings rows in the Ledger Client Standard's code generation and bindings domain. Milestone 4 keeps the generator compatible as Canton evolves.

### 4. Backward Compatibility

No backward compatibility impact. Existing dazl-client code keeps working. Smart Contract Upgrade does not apply because the generator creates no Daml contracts. Teams regenerate bindings after a package upgrade.

## Milestones and Deliverables

Deadlines count from grant approval.

| Milestone | Deadline | Done when |
|---|---|---|
| 1. Generator | Month 2 | An outside developer runs a create, an exercise and a JSON read with generated types. |
| 2. Documentation and Examples | Month 3 | Two outside developers generate bindings for their own packages from the documentation. |
| 3. Adoption | Months 3 to 12 | Outside applications use the bindings on MainNet. |
| 4. Maintenance | 12 months from Milestone 2 | Obsidian publishes a maintenance note each quarter. |

An outside developer tests Milestone 1 without help from Obsidian. The developer uses someone else's package, a local ledger and the README. Milestone 2 documents the escaping and module schemes with three worked examples. Each release lists the Daml-LF versions it supports and follows semantic versioning. Obsidian recruits the outside developers through Canton developer channels. A reviewer named by the committee runs any steps left unfinished 30 days after milestone submission.

An application qualifies for Milestone 3 when an organization other than Obsidian runs it. Its party must submit at least 1,000 transactions through generated bindings over at least 60 days. The organization emails its party ID, tool version, transaction count and period to the committee or privately to the Foundation. Obsidian provides the template. The Foundation confirms private reports to the committee.

Obsidian releases a compatible version within four weeks of each Canton release that changes Daml-LF or the JSON value format. Maintenance also covers security and dependency updates, issue triage and outside contributions. The committee decides on renewal by month 15. Obsidian transfers the repository to the Foundation's GitHub organization if the committee does not renew.

## Acceptance Criteria

The Tech & Ops Committee accepts each milestone against the completion criteria above.

## Funding

**Total Funding Request:** 1,270,000 CC

| Milestone | Deadline | CC | Paid upon |
|---|---|---|---|
| 1. Generator | Month 2 | 400,000 | Committee acceptance |
| 2. Documentation and Examples | Month 3 | 130,000 | Committee acceptance |
| 3. Adoption | Months 3 to 12 | up to 500,000 | 100,000 per application, up to four, plus 100,000 at the fourth |
| 4. Maintenance | 12 months from Milestone 2 | 240,000 | 60,000 per quarter |
| Total |  | 1,270,000 |  |

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin. Obsidian may request a re-evaluation of the remaining milestones at month 9. The trigger is a CC price more than 25 percent above or below its price at approval. The Tech & Ops Committee runs the re-evaluation.

## Co-Marketing

At release, Obsidian will announce with the Foundation, publish a technical post and present on a Canton developer call.

## Motivation

RFP #17 names Python as one of six languages whose kits need Ledger Client Standard alignment. Python teams hand-write classes for each package and rewrite them when it changes. Generated types remove that work. Obsidian estimates three to five adopting organizations in the first year. Milestone 3 pays per qualifying application.

## Rationale

The generator extends dazl-client and reuses its Daml-LF parser where that fits. It can live in the dazl-client repository if the maintainers prefer. Hand-written classes repeat work in every team and drift from the package. A Python back end for Digital Asset's JVM code generator would add a JVM at generation time. "Rust SDK for Canton Network" ([PR #407](https://github.com/canton-foundation/canton-dev-fund/pull/407)) plans to use Digital Asset's DAR-reading JVM library where it is available for external use. "Noders DamlForge: Pythonic Contract Language PoC for Canton" ([PR #629](https://github.com/canton-foundation/canton-dev-fund/pull/629)) explores writing contracts in Python. The generator makes existing Daml packages usable from Python.

## Constraints, Limitations and Out of Scope

Transport, authentication and the other Ledger Client Standard domains stay with dazl-client. The grant excludes dpm component packaging and a third-party security audit. The generator runs at build time. Generated code holds no private keys. The generator writes contract key types like other types. Milestone 1 settles any additional handling of contract keys.

Milestone 1 counts the templates and data types in the Splice Amulet package. Scope covers packages up to twice that count. A larger package, a Daml-LF feature outside this scope, a Canton release that needs a new parser or a dazl-client release that breaks submission triggers a re-scope with the committee.

Each deadline shifts by the committee's review time for the previous milestone. Unpaid Milestone 3 amounts lapse at month 12. An adopter may still be inside its 60 days at month 12. The committee may then extend the deadline by up to three months. Obsidian reports at milestone submissions and files no interim reports.

## About Obsidian Systems

Obsidian Systems builds production Canton systems for financial market infrastructure. It runs the Foundation-funded Daml 3 training program. Obsidian co-founder Ryan Trinkle sits on the Foundation board. Obsidian holds seats on five Canton Network committees. The Foundation has approved Obsidian's LMS maintenance and dpm-nix grants. Obsidian engineers have built Python bindings for Daml packages on client projects.
