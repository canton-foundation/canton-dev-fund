## Development Fund Proposal

**Author:** Colin Hobbins @ Obsidian Systems (colin.hobbins@obsidian.systems)
**Status:** Draft
**Created:** 2026-07-15
**Label:**  daml-tooling

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):**  Ali Abrar @ Obsidian Systems


---

## Abstract

Obsidian Systems has developed a code formatting tool that it uses on a variety of proprietary Daml codebases. This tool is currently closed source. We propose to open source it and contribute it to the Canton ecosystem. The tool, `daml-format`, will be available as:

1. A DPM component installable via `dpm`;
2. A standalone executable available through various other package managers;
3. An extension or plugin for popular editors including VS Code;
4. A GitHub Action; and
5. A Daml parser and formatter library for others to build on.

Code formatting options include options common to formatting tools for similar languages (like Haskell) and options specifically for Daml constructs. The `daml-format` core is tested against a corpus of real Daml code including Splice, daml-finance, and two proprietary codebases spanning Daml 2.x and 3.x.

---

## Specification

### 1. Objective

Nearly every language has a code formatter, and Daml should as well. We at Obsidian and our clients in the industry insist on code formatting as part of CI pipelines and high-quality code delivery. Code formatting helps ensure consistency, reduces mental overhead, results in cleaner diffs, and facilitates [better understanding](https://blog.obsidian.systems/formatting-is-an-interface-between-code-and-reasoning/) of the code.

`daml-format` serves two important purposes. First, we want every engineer working on a Daml codebase to have easy access to a formatting tool that is *fast*, configurable, and easy-to-use. Second, CI pipelines and pre-merge checks should be able to trivially validate formatting.

Even on projects that care enough about formatting to write up a style guide, manual enforcement has a ceiling: our testing of codebases that officially require a particular style found many, many instances of variation that were not caught in manual review.

`daml-finance`, for example, has a published style guide. When those style guide rules are encoded as a `daml-format` configuration, the tool turns up hundreds of small deviations from the style guide. None of the deviations alter the quality of the code or would raise a red flag during review, but each one represents a little drift, and a tiny extra bit of cognitive overhead for later consumers of the code. Automatic formatting eliminates this problem.

Formatting should be something a team decides once and then stops thinking about. It keeps working in the background: every diff, every review, every read costs a little less attention because the code's shape is consistent.

#### Deliverables
The scope of this proposal covers open-sourcing of work that is already complete and work that we have planned but not yet completed.

Complete and in production use on Obsidian's Daml codebases:

- The core CLI executable, which is a statically compiled Haskell binary with no runtime dependencies.
- The lossless parser and CST, which preserves comments, whitespace, source spans, and pragmas.
- The configurable formatting engine, which comes with three style presets (`obsidian`, `daml-finance`, `splice`) and configuration options for custom styles.
- Corpus test infrastructure, which checks for idempotence in Nix derivations, performs semantic validation, and is run against Splice, daml-finance, and internal Obsidian codebases.

New development that will be done under this proposal:

- Public open-source release: BSD-3-Clause source at `github.com/obsidiansystems/daml-format`.
- Hackage publication: Canonical open-source Haskell distribution.
- DPM component: Multi-platform component published to an OCI registry via `dpm publish component`, installable in Canton projects through the Daml Package Manager.
- Package manager distribution: Static binaries on GitHub Releases (Linux, macOS, Windows), container image on `ghcr.io`, Homebrew, nixpkgs, Ubuntu/Debian PPA, RHEL/Fedora RPM repo, Scoop, and WinGet.
- Editor and hook integrations: VS Code extension with format-on-save; Vim and Emacs recipes; git pre-commit hook example.
- GitHub Action: Reusable workflow and composite action on the GitHub Marketplace.
- Behavioral semantic validation: A test Daml project with its own test suite, which will extend the existing checks to validate that formatting preserves behavior, not just compilation.
- Documentation: README, formatting reference, migration guide for teams moving from hand-formatting to `daml-format --check`.

### 2. Implementation Mechanics

The requirements below describe what a Daml formatter must satisfy:

1. Lossless parsing
2. Rendering
3. Determinism and idempotence
4. Configurability
5. Preservation of semantic validity
6. Speed

#### Lossless Parsing

The Daml parser must preserve all data, including comments and other meaningful data even if not used by the compiler. To fulfill this objective, we have built a parser that preserves comments, "trivia" (e.g., whitespace), source spans, and pragmas.

The parser produces a Concrete Syntax Tree (CST, as opposed to an Abstract Syntax Tree). The CST is a tree of the Daml program's text, where every part of the source file is a node. The CST is able to identify all valid constructions found in Daml source files, including:

* module headers
* exports
* imports
* type signatures
* value bindings
* `data`
* `newtype`
* type aliases
* classes
* instances
* templates
* interfaces
* exceptions
* `interface instance`
* expressions
* patterns
* template/interface body elements
  * `signatory`
  * `observer`
  * `ensure`
  * `key`
  * `maintainer`
  * `choice`
  * `nonconsuming choice`
  * `viewtype`

When an unrecognized form of syntax is encountered, the parser stores it as a raw, unparsed string with source information. Our testing against real-world codebases, however, has resulted in zero raw fallbacks. We conducted our tests across 736 Daml source files (102 in Splice, 634 in daml-finance) plus two internal Obsidian codebases spanning Daml 2.x and 3.x; every top-level declaration in the tested corpora parses into a structured CST node.

#### Rendering

The process of rendering takes the CST as input and produces output formatted according to supported formatting rules. A rendered document has exactly the same semantic meaning as the document that produced the CST (i.e., the AST remains the same). Parsing the rendered document may, however, result in a different CST if the rendering resulted in a change in format.

We have built a test suite that includes golden tests (going from inputs to known-good outputs), configuration options, and per-preset outputs. Additional testing details are available in Appendix B.

#### Determinism and Idempotence

The formatter must be both deterministic (the same input produces the same output every run) and idempotent (`format(format(x)) == format(x)`). Determinism is a precondition for any automated check. Idempotence is what lets teams re-run the formatter without churn and lets CI treat `daml-format --check` as a binary signal rather than a probabilistic one.

We enforce idempotence as a build-time invariant, not an aspiration. Our CI pipeline runs a corpus idempotence test that pulls pinned versions of Splice (102 files) and daml-finance (634 files), formats each of the 736 Daml source files twice, and fails the build if the second format differs from the first. Zero failures across the corpus today. Additional details are available in Appendix B.

#### Configurability

The formatter provides both preset styles and rich configuration options. The presets are Obsidian style, daml-finance style (an encoding of [that project's style guide](https://github.com/digital-asset/daml-finance/blob/main/STYLEGUIDE.md)), and splice style (calibrated against the actual splice codebase).

Many other styling options are borrowed from popular Haskell formatting tools such as [fourmolu](https://hackage.haskell.org/package/fourmolu). Daml-specific configuration options were added based on observed differences in the example codebases.

The full set of configuration options is available below in Appendix A.

#### Preservation of Semantic Validity

Formatting must produce valid Daml that does not alter the meaning of a program. Our CI pipeline formats a test Daml project and runs `daml build` on the output. As part of the productization work, we will add a more complex Daml project with its own test suite and verify that tests continue to pass after formatting.

The lossless CST and raw-token fallback close the safety loop: unrecognized syntax is preserved verbatim rather than guessed, so the failure mode is "less formatting than possible" and never "wrong output."

#### Speed

A code formatter must be *fast*. Many editors invoke code formatters every time the user saves a file. Agentic development workflows similarly run code formatters after every code change. We also do not want to add any significant overhead to CI workflows. Parsing and formatting must be near-instantaneous.

`daml-format` is a single statically-compiled Haskell binary. It does not have any runtime dependencies (it does not need, e.g., the Daml SDK, JVM, etc).  A typical Daml file of several hundred lines in length can be processed in a couple of milliseconds. See Appendix C for more information on performance.

### 3. Architectural Alignment

- Simple integration: daml-format requires no toolchain modifications. It is a standalone executable that doesn't link against `damlc`, doesn't modify the Daml SDK, and doesn't require other changes. Users install the binary and run it without having to change anything else in their toolchain.
- Standard adoption pattern: `daml-format --check` can be used in CI, and format-on-save can be used in editors. Project-specific configuration settings can be stored in configuration file. In all these ways, `daml-format` is the same as established tooling like `gofmt`, `rustfmt`, `prettier`, and `fourmolu`. These are patterns Canton's developer base is familiar with from other ecosystems.
- Composable with existing tools: The Daml VS Code extension, `damlc`, `daml build`, and existing CI stay as they are. `daml-format` enables additional functionality alongside them.
- Encodes existing styles, doesn't impose new ones: The `daml-finance` preset implements the published DAML Finance Style Guide. The `splice` preset is calibrated against the actual splice codebase. The `obsidian` default preserves user choices where the style guide is silent. The configuration options are rich enough to roll-your-own style if you prefer.
- Reproducible and heavily tested builds: Builds and tests run inside Nix derivations against pinned inputs, including pins of large real-world daml codebases used in the test suite.

### 4. Backward Compatibility
*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: Open-source release
- **Estimated Delivery:** Immediately upon grant acceptance
- **Focus:** Release existing tooling under BSD-3-Clause and make it installable.
- **Deliverables / Value Metrics:**
	- Public open-source repository at `github.com/obsidiansystems/daml-format`
	- Hackage publication (canonical open-source Haskell distribution)
	- Static binaries on GitHub Releases (Linux, macOS, and Windows)
	- Container image published to `ghcr.io/obsidiansystems/daml-format`
	- DPM component published to an OCI registry (multi-platform), installable via `dpm`
	- README, formatting reference, user guide
	- Subsequent milestone components tracked as GitHub issues

### Milestone 2: Package distribution and behavioral validation
- **Estimated Delivery:** 2 months after grant acceptance
- **Focus:** Standard package manager reach on Linux, macOS, and Windows; extend semantic validation
- **Deliverables / Value Metrics:**
	- Homebrew formula (tap or `homebrew-core`) with `brew install daml-format` working
	- nixpkgs submission with `nix-env -iA nixpkgs.daml-format` (or equivalent) working
	- Ubuntu/Debian PPA with `apt install daml-format` working
	- RHEL/Fedora RPM repo with `dnf install daml-format` working
	- Scoop manifest with `scoop install daml-format` working
	- WinGet manifest with `winget install daml-format` working
	- Git pre-commit hook example and reference configuration
	- A test Daml project with its own test suite (Daml Script or equivalent)
	- CI job that formats the project and runs the test suite
	- The test suite passes on both the unformatted and the formatted (in each of the three preset styles) project

### Milestone 3: Editor and CI integrations
- **Estimated Delivery:** 3 months after grant acceptance
- **Focus:** Format-on-save in editors; one-line CI adoption.
- **Deliverables / Value Metrics:**
	- VS Code extension published to the marketplace
	- Vim / neovim plugin with installation documentation
	- Emacs plugin (MELPA submission)
	- GitHub Action published to the GitHub Marketplace (reusable workflow plus composite action), consumable via `uses:` from any external repo

### Milestone 4: Ecosystem Adoption
- **Estimated Delivery:** Within 12 months of Milestone 1
- **Focus:** External adoption of `daml-format` by teams outside Obsidian Systems.
- **Deliverables / Value Metrics:**
	- At least 10 total  from organizations other than Obsidian Systems or its subsidiaries, where a unit is either:
		- A public Daml repository with `.daml-format` configuration committed or the `daml-format` GitHub Action referenced in a workflow, or
		- A written attestation from an adopting organization confirming use of `daml-format`, shareable with the Committee.
	- Verification: public repos verifiable via GitHub code search or attestations submitted to the Committee alongside the milestone claim.
	- The milestone pays in full upon reaching the aggregate bar and does not pay partial credit below it.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

---

## Funding

**Total Funding Request:** 2,875,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Open-source release): 875,000 CC upon delivery
- Milestone 2 (Package distribution and behavioral validation): 875,000 CC upon delivery
- Milestone 3 (Editor and CI integrations): 750,000 CC upon delivery
- Milestone 4 (Ecosystem Adoption): 375,000 CC upon delivery

### Volatility Stipulation
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

---

## Motivation

The absence of a formatter has concrete costs across the Daml ecosystem:

- Review friction: Reviewers spend cycles on whitespace and indentation instead of behavior. Every Daml team pays this cost on every PR.
- Onboarding tax on new developers: Per the Canton Foundation's Q1 2026 developer survey, 71% of respondents come from an EVM background and 80% joined the ecosystem in the last 12 months. Developers arriving from other ecosystems expect format-on-save, `--check` in CI, and style guides enforced automatically. We at Obsidian have observed first-hand that developers unfamiliar with Haskell/ML/Daml-style languages often struggle with code layout decisions in ways that cause real confusion.

Every Daml developer benefits. Contributing code becomes more consistent and legible; reviewing others' code becomes cheaper. The benefit compounds as codebase size grows. All Daml projects are potential adopters: within 12 months of release, we expect `daml-format` to be a standard part of the Daml development experience.

Formatting is also a foundational piece of ecosystem infrastructure. Every downstream tool (code review, IDE tooling, code search) works better on consistently-formatted source. Consistent formatting helps LLMs learn Daml from the public source corpus, and helps LLM-based coding tools work reliably across Daml codebases. Without a formatter, each project solves these problems locally and none do it well.

---

## Rationale

**Why a standalone tool rather than an extension to `damlc`.**

Formatting and compiling are separate concerns. Adding a formatter to `damlc` ties the formatter's release cadence to the SDK, making it harder for the tool to evolve at the pace of community feedback. Other ecosystems overwhelmingly separate the two: `rustfmt`, `prettier`, `brittany`, and `fourmolu` all ship independently of their language's compiler.

**Why open-ended configuration.**

The three shipped presets (`obsidian`, `daml-finance`, `splice`) are useful starting points. Each one encodes a style that already exists in a real Daml codebase, and serve as sensible defaults for newcomers. The underlying configuration options (documented in Appendix A) allow any team to define their own preset to suit their tastes.

**Why the `obsidian` default preserves user choices.**

A formatter that aggressively normalizes everything produces massive first-run diffs, disorients contributors in code they used to know, and raises the cost of adoption. The `obsidian` preset preserves user choices where the style guide is not opinionated. This is a deliberate attempt to lower the friction of running `daml-format --write` for the first time.

**Why no long-term maintenance.**

Obsidian is going to maintain the executable regardless: client codebases pass through it daily, and any bug that would affect an external adopter would affect us first. Our thorough test coverage keeps that burden bounded, and we really only expect there to be new costs when language syntax changes as Daml evolves.

Everything that uses the executable (editor extensions, GitHub Action, package manager submissions) will be open sourced as ecosystem contributions. Obsidian will keep the core executable maintained and we expewct package manager submissions to incur near-zero maintenance after CI is set up. For editor and other integrations, community contributions will be welcome throughout. If the burden across the full surface turns out to be higher than we can absorb and there is high usage but low contribution, we may approach the committee for a follow-up grant to assist in integration maintenance.

**Why BSD-3-Clause.**

The Foundation's default recommendation is Apache 2.0. Our intent is BSD-3-Clause, matching the licensing pattern of our other open-source Haskell and Nix tooling. Both are OSI-approved permissive licenses and the practical differences are small. We're open to a relicense to Apache 2.0 if the committee considers it material.

---

## Appendix A: Configuration Options

Every option below is implemented in the current codebase and overridable via CLI flag or a `.daml-format` file. Presets (`obsidian`, `daml-finance`, `splice`) are bundles of these options.

**Design principles enforced by the defaults:**

1. Two-space indentation; no tabs.
2. No O(N) fixups for O(1) changes: no cross-declaration vertical alignment by default (opt-in via `align-equals` and `align-colons`).
3. Idempotence: `format(format(x)) == format(x)` on every input.
4. Safety: the formatter never rewrites a file after a parse or format failure.
5. Unix linefeeds; single trailing newline; no trailing blank lines.

**Configuration options:**

| Option | Type | Default (`obsidian`) | Notes |
| :--- | :--- | :--- | :--- |
| `indentation` | Int | `2` | Spaces per indentation step |
| `column-limit` | Int | `100` | Max line length before automatic line breaking |
| `comma-style` | `leading` \| `trailing` | `leading` | Comma placement in multi-line lists, records, tuples, imports, exports |
| `import-export-style` | `leading` \| `trailing` \| `diff-friendly` | `leading` | Multi-line module export and import list style |
| `import-grouping` | `grouped` \| `ungrouped` | `grouped` | Blank lines between Prelude / `DA.*` / project groups |
| `import-sorting` | `sort` \| `preserve` | `sort` | Alphabetical vs. source-order within groups |
| `newlines-between-decls` | Int | `1` | Blank lines between top-level declarations |
| `blank-line-normalization` | `respectful` \| `collapse` \| `normalize` | `respectful` | Repeated blank-line handling |
| `record-brace-space` | Bool | `True` | `r { f = v }` vs. `r {f = v}` |
| `function-arrows` | `trailing` \| `leading` \| `leading-args` | `trailing` | `->` placement in multi-line type signatures |
| `indent-wheres` | Bool | `False` | 2-space vs. 4-space `where` indent |
| `let-style` | `auto` \| `inline` \| `newline` \| `mixed` | `auto` | `let ... in ...` layout |
| `if-style` | `linear` \| `hanging` | `linear` | `if`/`then`/`else` layout |
| `single-constraint-parens` | Bool | `False` | `Eq a => ...` vs. `(Eq a) => ...` |
| `align-equals` | Bool | `False` | Vertical alignment of `=`. Off by default |
| `align-colons` | Bool | `False` | Vertical alignment of `:`. Off by default |
| `operator-style` | `leading` \| `trailing` | `leading` | Infix operator placement in multi-line chains |
| `respectful` | Bool | `True` | Preserve programmer-chosen blank lines within function bodies |
| `simple-clause-layout` | `respectful` \| `one-line` \| `multiline` | `respectful` | Layout of `signatory`, `observer`, `ensure`, `key`, `maintainer`, `viewtype` |

---

## Appendix B: Testing

**Test suite categories.**

- Golden tests: input source with known-good formatted output for each preset.
- Configuration tests: each option exercised across its value range.
- Preset tests: each preset's output verified against fixture files.
- CLI behavior tests: `--check`, `--write`, `--diff`, stdin handling, exit codes.
- Parse-failure tests: verifies that failed parses leave source files untouched.

**Corpus idempotence tests.** Nix derivations that verify `format(format(x)) == format(x)` as a build-time invariant:

| Derivation | Corpus | Files |
| :--- | :--- | :--- |
| `corpusIdempotence` | [hyperledger-labs/splice](https://github.com/hyperledger-labs/splice) (pinned) | 102 |
| `damlFinanceCorpusIdempotence` | [digital-asset/daml-finance](https://github.com/digital-asset/daml-finance) (pinned) | 634 |

Each derivation unpacks the pinned thunk, formats every `.daml` file twice, and fails the Nix build if the two outputs differ. Zero failures across 736 files at time of writing.

**Corpus diff inspection.** `tools/corpus-diff/` ranks corpus files by CST complexity (tree size, as a syntax-complexity proxy), tracks raw-fallback counts per file, and produces diffs of the most complex files for human review. This lets us inspect what the formatter actually changes on a corpus and separate intentional churn (import sorting, `do` on its own line, trailing whitespace removal) from unexpected behavior. Diff size measures noise, not correctness.

**Semantic validation.** CI formats a Daml test project and runs `daml build` on the formatted output; the CI step fails on compilation failure.

**Build reproducibility.** All builds and tests run inside Nix derivations against pinned inputs:

- Pinned `nixpkgs`
- Pinned [`nix-daml-sdk`](https://github.com/obsidiansystems/nix-daml-sdk)
- Pinned corpus thunks (Splice, daml-finance)

The GitHub Actions workflow and a local `ci.sh` script ship in the repo.

---

# Appendix C: Performance

## Binary characteristics

- Single statically-compiled Haskell binary.
- No runtime dependencies.
- No cold-start penalty from a language runtime.

## Measurement environment

| Field | Value |
| :--- | :--- |
| Machine | Framework Laptop 13 (AMD Ryzen AI 300 Series) |
| CPU | AMD Ryzen AI 9 HX 370 (24 logical cores) |
| Memory | 125 GiB |
| OS | NixOS 26.05 (Yarara), Linux 7.1.3 |
| Storage | ZFS (single pool) |

## Per-file formatting time

Pure format work (lex + parse + render), excluding process startup and I/O.
Measured single-threaded on the daml-finance corpus (634 files); each file is
formatted 5 times and the minimum is reported.

| Metric | Value |
| :--- | :--- |
| Median | 0.39 ms |
| p95 | 2.79 ms |
| Max | 43.2 ms |

## Full-corpus timing

Wall-clock to `--write` every file, best of 3 runs (fresh copy each run).
Single-threaded uses `-N1`; Parallel uses `-N24`.

| Corpus | Files | Single-threaded | Parallel |
| :--- | :--- | :--- | :--- |
| Splice | 102 | 0.25 s | 0.16 s |
| daml-finance | 634 | 0.68 s | 0.36 s |
| Combined | 736 | 0.86 s | 0.41 s |

## Notes on the measurement

- The max-file outlier (about 43 ms) is `Swap/Test/Fpml.daml`, a single 170 KB
  generated test file. Median per-file work is sub-millisecond.
- Parallel speedup is roughly 1.9x on 24 logical cores. Serial formatting is
  already fast (sub-second), so wall-clock is dominated by per-process
  startup and the single largest file (load imbalance), not by aggregate
  compute.
- The machine was under variable load during measurement (1-minute load
  average between 1 and 4); figures are best-of-3 to reduce the noise this
  introduces.
- A fully cold page cache could not be guaranteed (dropping the ZFS ARC would
  require root). This has little effect on the numbers because the formatter is
  CPU-bound.