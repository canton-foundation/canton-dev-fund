# Daml LSP Development Fund Proposal

**Author:** Heitor Toledo Lassarote de Paula, on behalf of [Serokell OÜ](https://serokell.io)

**Status:** Submitted

**Created:** 2026-07-14

**Label:** daml-tooling

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Need Champion

---

## Abstract

This proposal aims to replace the legacy Ghcide-based Daml language server with a modern fork of Haskell Language Server (HLS), tailored specifically for Daml. This upgrade will bring Daml developers new capabilities that streamline development, help onboard new developers, move Daml Studio onto a newer and battle-tested foundation, and provide a platform for future Daml- and Canton-specific features.

---

## Specification

### 1. Objective

Daml Studio’s language server is still being built on Digital Asset’s own 2019 fork of Ghcide, a project that Digital Asset itself originated and handed over to the Haskell community. The fork of Ghcide is essentially frozen at around the time [the project was handed over](https://blog.digitalasset.com/blog/handing-over-ghcide-to-the-haskell-community) and [joined with the Haskell IDE Engine](https://neilmitchell.blogspot.com/2020/01/one-haskell-ide-to-rule-them-all.html) project in January 2020 to found the Haskell Language Server.

The Canton Development Fund explicitly states to [extend what already exists](https://github.com/canton-foundation/canton-dev-fund/blob/38217826a7c0ca1c2b456b1bd5623649ecff6f71/proposals/_template.md#rationale) by default. In the upstream Ghcide, there is still [a vestigial comment](https://github.com/haskell/haskell-language-server/blob/048cb169ce269e46015afcb9631e9378400bb272/ghcide/src/Development/IDE/LSP/LanguageServer.hs#L6-L7) requesting to keep it in sync with `DA.Daml.LanguageServer`; a resulting scar tissue showing that a drift happened and Daml never came back to the lineage it helped to start. [Another comment](https://github.com/digital-asset/daml/blob/139b01b2c6a07c61d32507eaee0a16b5d76a6a09/sdk/compiler/damlc/lib/DA/Cli/Damlc/Command/MultiIde/Forwarding.hs#L144) also makes it clear that the Ghcide fork has fallen behind and that many capabilities are now supported by HLS.

In face of this, we propose to fork HLS, a production-grade battle-tested language server for Haskell to create a new Daml language server with similar features. The objective is to provide Daml developers with a modern IDE experience built from existing HLS features while keeping existing Daml Studio features. Moreover, we wish to untie the Daml experience from Visual Studio Code exclusively by creating thin Daml IDE wrappers for Vim (and Neovim).

### 2. Implementation Mechanics

The [Language Server Protocol](https://microsoft.github.io/language-server-protocol/specifications/specification-current/) (LSP) is a JSON‑RPC protocol that lets editors communicate with a language server to provide real‑time diagnostics and code intelligence (navigation, refactoring, formatting, etc.). Today, `damlc ide` is a Haskell process that implements an LSP backend for Daml, based on a 2019 fork of Ghcide and extended with Damlc-specific rules. Those rules are compiled against Daml’s fork of GHC 8.8.1. Haskell Language Server (HLS) is built on the same Ghcide-derived architecture; because Daml is Haskell-shaped and Damlc is itself a GHC fork, we expect Daml to be a good fit for an HLS-based implementation. In other words, this work retargets HLS to Daml rather than rewriting the language server from scratch.

We currently identify the following key components:

1. **Damlc**: Daml’s compiler, implemented in Haskell and based on a fork of GHC 8.8.1. Where needed, we will port existing mechanisms to support reliable IDE integration rather than reimplementing them.
2. **Damlc IDE (damlc ide)**: a retargeted and streamlined fork of Haskell Language Server (HLS), including a curated set of plugins. It will be extended with Daml-specific handlers for custom LSP methods.
3. **Ghcide IDE state and Shake incremental build graph**: we expect these to remain largely unchanged, subject to confirmation in Milestone 1.
4. **Compiler-hook extension points**: `optPreprocessor` (AST-level desugaring, syntax, and lint) and `optGhcSession` (session loading driven by `daml.yaml`). Both appear preservable, but Daml’s current preprocessor takes extra arguments (including `GHC.DynFlags`) not present in our likely HLS baseline’s version of this field, so some adapter work may be needed here. We will validate the exact shape of the scope in Milestone 1.
5. **Daml Studio**: the editor client layer, delivered primarily as a Visual Studio Code extension. The TypeScript code covers functionality that is not easily expressed through standard LSP, such as the web views for table and transaction results. We also plan to provide thin LSP-based integrations for Vim/Neovim, alongside syntax highlighting.
6. **Damlc Multi-IDE (damlc multi-ide)**: a multi-IDE coordinator architecture behind multi-package support. Spawns one `damlc ide` per package and proxies LSP messages between them and the client. Its per-method routing table and `initialize` response must be updated to support the new capabilities that the HLS fork will bring (see [`Forwarding.hs`](https://github.com/digital-asset/daml/blob/139b01b2c6a07c61d32507eaee0a16b5d76a6a09/sdk/compiler/damlc/lib/DA/Cli/Damlc/Command/MultiIde/Forwarding.hs#L81) and [`Util.hs`](https://github.com/digital-asset/daml/blob/139b01b2c6a07c61d32507eaee0a16b5d76a6a09/sdk/compiler/damlc/lib/DA/Cli/Damlc/Command/MultiIde/Util.hs#L102)). To be scoped precisely in Milestone 1.
    - The multi-IDE already resolves and dispatches the correct Damlc binary for each package’s pinned SDK version, which plays a similar architectural role as `haskell-language-server-wrapper` plays for choosing a GHC version. Damlc also has been pinned to GHC 8.8.1 for years, and so we believe no per-SDK-version build matrix will be needed like HLS does for GHC versions. This only covers per-binary runs, though, it doesn’t cover per-project behavior such as DAML-LF’s target-aware diagnostics, which still needs porting work. The nested point in the 2nd point in Milestone 1 is about covering it.

We plan to divide the project into six milestones: in Milestone 1, we will find an exact HLS version and GHC target through source-level inspection that is appropriate for this project, producing a decision document. In Milestone 2, we will build a fork of HLS that boots against Damlc without Daml-specific features, validating the bridge between the IDE and the compiler, producing a bootable language server. In Milestone 3, we’ll port Daml-specific and client-layer additions on top, producing an installable language server plus editor integrations. In Milestone 4, we’ll provide Vim and Neovim support for the language server and syntax highlighting. Milestone 5 will be about promoting adoption and migration to the new language server and editor extensions. In Milestone 6 we’ll provide support for the new language server and extensions.

### 3. Architectural Alignment

Every application built on Canton with Daml begins with a text editor. Currently, the IDE experience for Daml has been built on top of a 2019 fork that has since drifted. Moving Daml Studio to the actively maintained HLS will help with the onboarding experience of new users and give the community more tools to write Daml effectively.

[CIP-0082](https://github.com/canton-foundation/cips/blob/429b4bc4926441deedb23c8a2786ee40973cd427/cip-0082/cip-0082.md) established the 5% development fund, which directly cites “dev tools” along with other core, critical infrastructure as an intended use, in which the Daml Studio modernization fits squarely. In addition, [CIP-0100](https://github.com/canton-foundation/cips/blob/429b4bc4926441deedb23c8a2786ee40973cd427/cip-0100/cip-0100.md) directly states that “Grants are generally expected to be weighed towards adoption milestones which generate utility & value to the ecosystem.” Hence, Milestone 5’s acceptance criteria are built around developer/editor adoption rather than artifact delivery. This CIP also states that “the development fund SHOULD also take into consideration grant proposals for developer marketing and developer relations activities that have as their milestone objectives pulling more developers into the ecosystem”, which is the basis of the co-marketing commitments below.

This proposal sits entirely in Canton’s tooling layer and never touches the network’s runtime or consensus layers. As there is no interaction with the protocol, participant nodes, or the global synchronizer, it’s an investment that doesn’t add new parts to Canton’s surface or changes the network’s safety or trust guarantees.

The new language server and extensions will use the Apache-2.0 license, the same license used by HLS, Daml’s fork of Ghcide, and the Daml monorepo.

### 4. Backward Compatibility

This proposal replaces the language-server backend used by every Daml Studio user. Because the server is delivered as `damlc ide`, the change will reach users whenever they upgrade their SDK.

While feature parity with the current server is the goal, it cannot be assumed up front. Some areas will only be confirmed in Milestone 1. In addition, the Daml-specific custom LSP methods under `daml/` will be reimplemented on a new HLS-based host. As a result, the client-side behavior in Daml Studio must be re-validated against the new server. This is not a zero-touch migration.

To reduce upgrade risk and give users a migration path, we considered three options:

1. **New VS Code extension**: publish the updated Daml Studio as a separate extension, allow users to opt in and test, and have the existing extension advertise the new one. Later, the new extension can be deprecated and merged back into the original listing.
2. **SDK-tied cutover**: ship the new server with a specific SDK release, producing a hard cutover where users choose between upgrading (new server) or staying on an older SDK (old server).
3. **Dual shipping with a toggle**: ship both servers for a period of time and let users switch via configuration, while clearly marking the legacy server as deprecated. After sufficient adoption, remove the legacy server.

Our recommendation is to choose option 1. It’s a trade-off between user experience and engineering effort. Option 2 forces every user onto the new language server with no time to adapt and test, while option 3 requires shipping and maintaining two language servers at once. Option 1 lets users opt in explicitly, avoiding the risk of unintentionally entering the new experience as in option 3. That said, option 1 also has a cost: the new extension must bundle a language server decoupled from the old SDK’s Damlc version, otherwise we recreate the option 2 problem, just split across two extensions. We tie this explicitly to Milestone 5: reaching the B3 adoption threshold within its measurement window is the trigger to begin deprecating the legacy extension.

We propose decoupling `damlc ide` and `damlc multi-ide` from `damlc` and shipping the new extension via a separate binary, for example, by dispatching `daml-language-server` through `dpm ide` and `dpm multi-ide`.

---

## Milestones and Deliverables

### Milestone 1: Discovery & Research

Estimated time: 3 weeks.

During the first phase, we would like to perform a deep dive into Damlc and HLS to deliver a document investigating:

1. Which HLS version should serve as the baseline given Damlc is forked from GHC 8.8.1.
2. How well HLS and Damlc fit together, mapping what should integrate cleanly, what Damlc features would need to be added, and what Damlc parts would require adaptations.
    - Damlc also depends on the Daml-LF version. The same source file can validate in one project and fail on another based on this setting. This is a per-project behavior rather than a per-SDK version behavior. Hence, whatever Daml-LF version the fork builds must correctly read and thread the target Daml-LF for the project.
3. Whether any GHC changes will have to be backported into Damlc to fit the target HLS version, essentially a minor version compiler upgrade. Damlc's compiler is built from its own patched, vendored copy of GHC via `ghc-lib`, a project Digital Asset itself actively maintains, so retargeting to a newer GHC version means porting Digital Asset's existing patches onto that version's source rather than a new toolchain integration. Public `ghc-lib` flavors already exist for both GHC 8.8.1 and 8.8.4, giving a ready diff baseline for scoping that port precisely.
4. Which HLS changes will be necessary to support Daml-specific features and changes from Haskell.
5. How to support existing Daml Studio features, such as the transaction and table views, with the new work porting HLS.
6. Related to the above point, how to develop these features into other editors, such as Vim. For this, we may investigate and even consider porting existing tools, such as [https://github.com/Sengoku11/daml.nvim](https://github.com/Sengoku11/daml.nvim).
7. Which HLS features/plugins to keep and which to drop, along with the reasons for the decisions. The plan is to support as many as possible, and only drop the ones that don’t make sense for Daml or if Daml infra doesn’t give enough support to justify the feature.
    - For example, Daml doesn’t have an official formatter, and creating one is outside the scope of this work, and this feature would be dropped. However, we plan to submit a proposal for a formatter soon.
    - Whether LSP features that depend on block-level source structures, like folding ranges, rename, call hierarchy, etc., need Daml-specific reconstruction logic. `template`/`choice`/`interface`/`exception` blocks desugar into flat sibling declarations during parsing with no surviving marker of the original block. The likely fix is a Daml-specific field on the relevant declarations, using GHC’s [Trees That Grow](https://simon.peytonjones.org/assets/pdfs/trees-that-grow.pdf) (TTG) technique, which is present in Damlc. Nonetheless, this is still an intrusive change in Damlc and doesn’t necessarily mean that this is a small change, and so we’ll size this work during this milestone. If we find this is too costly to fit within Milestone 3’s budget, the fallback will be to ship without this feature, with a scope/budget amendment at the 6-month mark reevaluation and explicit disclosure of this limitation.
8. The necessary changes for `damlc multi-ide` to support HLS.
9. The scope to decouple `damlc ide` and `damlc multi-ide` from `damlc` for the new proposed extension.

The findings will be compiled into a single decision document and shared with the Foundation to guide our implementation in Milestones 2, 3 and 4.

The acceptance criteria for Milestone 1 is for the above list of documents to be published and approved by the champion/Committee.

### Milestone 2: Core Daml Language Server

Estimated time: 11 weeks.

This phase will focus on forking and rewriting HLS to a state where it will be compatible with Daml, but without Daml-specific features yet. We will also backport any needed GHC changes into Damlc. Damlc's compiler is built from its own patched, vendored copy of GHC rather than the stock `ghc-lib` package, so moving to a newer target GHC version means porting Digital Asset's existing compiler patches onto that version's source and producing a new patched `ghc-lib` flavor from it. Since `ghc-lib` is itself actively maintained by Digital Asset, and public `ghc-lib` flavors already exist for both GHC 8.8.1 and 8.8.4 as a diff baseline for scoping exactly what changed upstream, this is well-precedented, low-risk work rather than a new toolchain integration.

Damlc appears to be forked from GHC 8.8.1, a compiler release from August 26, 2019. No version of HLS appears to specifically target GHC 8.8.1, but other HLS versions target GHC versions 8.8.x. The following table maps GHC versions to the last HLS versions supporting it:

| GHC Version | HLS Version |
| --- | --- |
| 8.8.1 | None |
| 8.8.2 | 1.2.0 |
| 8.8.3 | 1.5.1 |
| 8.8.4 | 1.8.0 |

Given that HLS is a fast-moving project closely tied to GHC versions, we propose to evolve the language server in a similar way to Damlc: fork a specific HLS version and evolve it from there. HLS 1.8.0 is the last version to ever support GHC 8.8.4, and sits at the practical ceiling of how far the `ghc-lib` decoupling used can be pushed before a newer release’s own deleted compatibility scaffolding makes the port more costly than less costly. During Milestone 1, we’ll pick an HLS version to fork (possibly targeting one of GHC 8.8.x) and produce the integration plan, rather than choosing from an open field.

A preliminary investigation into HLS 1.8.0.0 shows support for the following features:

1. textDocument/hover
2. textDocument/documentSymbol
3. textDocument/definition
4. textDocument/typeDefinition
5. textDocument/documentHighlight
6. textDocument/references
7. workspace/symbol
8. textDocument/completion (via the Completions sub-plugin)
9. code lenses for missing type signatures (via TypeLenses)
10. open/change/save/close notifications driving diagnostics publication (via Notifications)

Moreover, there are around 20 optional plugins, each behind a cabal flag that's on by default in normal distributed builds: Hlint, Stan, Retrie, Rename, ExplicitImports, RefineImports, ModuleName, Pragmas, Splice, AlternateNumberFormat, ChangeTypeSignature, GADT, ExplicitFixity, Tactic, Class, HaddockComments, Eval, CodeRange, QualifyImportedNames, CallHierarchy, plus exactly one of Floskell/Fourmolu/Ormolu/StylishHaskell/Brittany for formatting, add capabilities like codeActionProvider, codeLensProvider, renameProvider, documentFormattingProvider, callHierarchyProvider, etc., depending on which are active.

In contrast, Daml Studio currently supports the following features:

1. textDocument/hover
2. textDocument/documentSymbol
3. textDocument/definition
4. textDocument/completion
5. Diagnostics.
6. Daml’s own Script Results code lenses.

See [`HoverDefinition.hs`](https://github.com/digital-asset/daml-ghcide/blob/2914f9328dc549bd4918c3cf0fc008690a102d70/src/Development/IDE/LSP/HoverDefinition.hs#L31) and [`Main.hs`](https://github.com/digital-asset/daml-ghcide/blob/2914f9328dc549bd4918c3cf0fc008690a102d70/exe/Main.hs#L86)

Everything else, such as references, rename, call hierarchy, workspace symbol search, document highlight, type definition, go-to-implementation, folding ranges, selection ranges, semantic tokens, etc., are missing.

The above list of features and plugins, as well as the exact HLS version to be forked is not final, subject to the investigation from Milestone 1.

The expected deliverable is an HLS fork that can integrate with Damlc and launch, possibly requiring Damlc changes to support it, while stubbing out Daml-specific syntactic constructs. This is also where we’ll decouple `damlc ide` and `damlc multi-ide` into two new executables and adapt the multi-IDE with our work.

At this stage, we expect shared Haskell features to work, while templates, choices, interfaces, and potentially cross-package support will be improved in the next milestone. By “work”, we mean that capabilities such as hovers, diagnostics, and go-to-definition should function correctly for shared Haskell constructs (e.g., data declarations, type classes, and top-level functions) when compiled through Damlc.

The acceptance criteria for this milestone are thus:

1. Forked server boots successfully against Damlc.
2. Kept features (hover, go-to-definition, etc.) work on shared Haskell features. Tested against a defined corpus such as the Daml standard library.
3. Daml-specific features (templates, interfaces, etc.) degrade successfully, without hangs or crashes. Those will be supported in Milestone 3.
4. `damlc ide` and `damlc multi-ide` successfully split into independently-versioned binaries.
5. Handling of project-specific Daml-LF versions.
6. CI builds successfully for Linux, macOS, and Windows based on DA’s Azure-based pipelines.
    - Note: Due to a segfault in using HLS 1.8.0.0 with GHC 8.8.4 on Windows, this combination was only built for Linux and macOS. We will check whether the problem will be present with our fork and Damlc on Windows, and if confirmed, provide a solution.

### Milestone 3: Daml Language Server Fine-Tuning

Estimated time: 11 weeks.

This phase focuses on two parts: porting existing Daml Studio features into the new language server, and implementing Daml-specific features on top of existing HLS features.

As of today, the identified extra Daml-specific features in Daml Studio are as follows:

- Code Lenses for “Script results”, wired with the `daml.showResource` command.
- textDocument/didOpen and textDocument/didClose: track which scripts are open.
- daml/virtualResource/didChange: provide HTML content containing both the table and transaction views.
- daml/virtualResource/didProgress: elapsed-time progress while a script is still running.
- daml/virtualResource/note: informational notes (e.g. “this script no longer exists in the file”).
- daml/keepAlive: liveness ping.
- And telemetry resources wired into didOpen/didClose/didChange.
- Split go-to definition: multi-IDE go-to definition support.

Along with these changes, we’d go back to the table of features produced during the first milestone (and tentatively suggested in the description of Milestone 2) to “teach” existing HLS features about Daml-specific syntax and semantic changes. Concretely, this also includes implementing the TTG annotation for Daml-specific structures scoped by Milestone 1, if permitted by the budget.

The deliverable for this phase is the completed language server. More specifically, it will include the Haskell package and executable with the language server, forked from HLS (the version to fork from will be determined from Milestone 1), exposing the standard capabilities from HLS plus the above capabilities from Daml Studio. This will include the full Visual Studio Code extension.

This work doesn’t add any new features that are not already in HLS or Daml Studio, but simply creates their union (modulo the discarded features which will be documented in Milestone 1).

Acceptance criteria:

1. All current Daml-specific LSP surface functionalities ported (see the list in Milestone 3’s description) and equivalent to the pre-port extension. Demonstrated against the same corpus from Milestone 2, plus 3 large Daml projects.
2. The multi-IDE supports the full set of ported features.
3. Compatibility gap/parity document published showing ported and dropped features, compared to the one from Milestone 1, also subject to the TTG work.
4. VSCode extension buildable and installable for the Committee’s testing and review.
5. Migration guide from the old to the new extension published.
6. CI is automated to build the full extension.

### Milestone 4: (Neo)Vim Support

Estimated time: 3 weeks.

In this phase, we’ll produce a Vim plugin in pure Vimscript akin to the Daml Studio extension.

The deliverable is a new repository with the Vim plugin supporting:

- Syntax highlighting for Daml.
- Integration with the language server.
- Table and transaction views for script results, provided via code lenses.
- Telemetry, by default opt-in and disabled, user will be able to change with a config file.

Acceptance criteria:

1. Vim/Neovim plugin buildable and installable via a standard plugin manager for the Committee’s testing and review including the above deliverables.
2. The same corpus from Milestone 3 demonstrated against the plugin’s syntax highlighting, LSP integration, table and transaction views, and opt-in telemetry.

### Milestone 5: Adoption & Migration

Measurement window: Up to 16 weeks.

In this milestone, to be started after the release milestones (Milestone 3 for the Visual Studio Code extension, Milestone 4 for the (Neo)Vim plugin), we propose to use externally verifiable mechanisms to track the adoption of the Visual Studio Code extension and (Neo)Vim plugin, using public Marketplace and GitHub statistics or signed attestations. None depend on grantee-operated telemetry.

We suggest 3 ways to gather evidence, which also serve as this milestone’s acceptance criteria:

- B1: Adoption enablement (1 tranche): The launch package is delivered, a migration guide published alongside the extension, at least 2 workshops or community sessions held, and at least 1 case study or technical blog post published.
- B2: Organizational adoption (up to 5 tranches): Up to 5 organizations independent of Serokell confirm, in a short written statement, or by private attestation to the Foundation under confidentiality, that their teams have installed the new Daml Visual Studio Code extension/(Neo)Vim plugin and use it in their own Daml codebases.
- B3: Visual Studio Code developer adoption (1 tranche): any one of the following within the measurement window:
    - 200 installs shown on the extension’s public Visual Studio Marketplace page.
    - At least 5 external GitHub issues/PRs from users independent of Serokell.
    - The B1 attestations jointly covering at least 25 developer seats, where a seat is an onboarded developer at the onboarded organization using the extension in their Daml work (each attestation includes an approximate seat count).
    - If no single path is met, the tranche pays proportionally to the best fraction achieved across the paths, starting at 50% of a threshold (for example, 100 Marketplace installs pay 50% of the tranche).
- B4: (Neo)Vim adoption (1 tranche): at least 10 developers using the (Neo)Vim plugin, shown by a composite of GitHub engagement, opt-in telemetry, and written statements.

We expect the Foundation and Digital Asset to support this milestone by facilitating introductions to the candidate organizations. If a candidate organization will not respond within 2 weeks of a review request, the organization is replaced on the onboarding pipeline.

The deliverable is an adoption report documenting the evidence for each tranche. Marketplace statistics, GitHub links, published artifacts, and the organizations’ feedback will be prepared and delivered by the Serokell team. No unverifiable method is used as a payment trigger.

### Milestone 6: Post-Grant Maintenance

Maintenance window: TBD, to be defined near the end of the main grant (Milestones 3 or 4).

Following our work, we should remain tracking SDK/Damlc releases, provide maintenance, triage community issues, and regularly check for fixes/features that can be backported into the HLS fork. The absence of this is how the 2019 Ghcide fork rotted. We’re committing to maintaining the new language server and editor extensions after the main grant period.

We are deliberately not attaching a budget to this milestone yet. A responsible estimate depends on the actual issue volume, the SDK release cadence to track, whether the new language server will be adopted into the official SDK distribution, and how much HLS synchronization proves necessary. We propose to define the structure, budget, and maintenance time window together with the Committee near the end of the main grant (around Milestones 3 or 4), choosing between one of the two forms:

- A separate renewable maintenance grant.
- A quarter-on-quarter maintenance milestone appended to this proposal. According to CIP-0100: *Where appropriate, including an ongoing “maintenance” milestone that starts applying quarter on quarter after initial delivery.*

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- Acceptance criteria defined for each milestone satisfied

---

## Funding

**Total Funding Request:** 3,272,727 CC considering the adoption tranches maxed

### Payment Breakdown by Milestone

- Milestone 1 *(Discovery & Research)*: 261,818 CC upon committee acceptance.
- Milestone 2 *(Core Daml Language Server)*: 829,091 CC upon committee acceptance.
- Milestone 3 *(Daml Language Server Fine-Tuning)*: 829,091 CC upon release and acceptance.
- Milestone 4 *((Neo)Vim Support)*: 261,818 CC upon release and acceptance.
- Milestone 5 *(Adoption & Migration)*: Up to 1,090,909 CC paid in independent tranches, and partial adoption pays partially:
    - B1: 109,091 CC triggered upon migration guide + 2 workshops + 1 case study or blog post.
    - B2: 109,091 CC (545,455 CC total) triggered per onboarded organization: installed + used on own codebase + written feedback. Each onboarded organization triggers 1 tranche, so 3 out of 5 organizations = 3 tranches.
    - B3: 327,272 CC triggered with 200 Marketplace installs, or 5 external issues/PRs, or 25 attended seats; pro-rata from 50% of a threshold.
    - B4: 109,091 CC triggered on adoption by 10 developers, composite evidence.
- Milestone 6 *(Post-Grant Maintenance)*: Funding deliberately TBD.

### Volatility Stipulation

The total estimated main project (Milestones 1, 2, 3, and 4) duration is 28 weeks (3+11+11+3), plus up to 16 weeks for the adoption and migration (Milestone 5), totaling 44 weeks when Milestone 5 is maxed. Accordingly, the denomination will be in Canton Coin and require a re-evaluation at the 6 month mark.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Developer or ecosystem promotion
- Upstream acknowledgment commitment by contributing non-Daml-specific fixes found in the fork back to HLS and credit the Foundation publicly
- As specified in Milestone 5, B1, 1 migration guide alongside the new extension, at least 2 workshop sections held, and at least 1 case study or technical blog post published

---

## Motivation

Every Daml developer uses a text editor, and most will rely on the language server as the primary interface to the SDK. A faster, more capable, and more reliable language server reduces day-to-day friction: it shortens feedback loops, improves navigation and discoverability in large codebases, and makes refactoring safer by catching issues earlier.

According to the [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/technology#1-dev-id-es), Visual Studio Code has been used by 75.9% of all respondents, Vim by 24.3%, and Neovim by 14%. Both Vim and Neovim have above-average “want to use” rates (15.7% and 13.3%, respectively) suggesting active switching interest.

The text editor is the primary interface to Daml, and improving the editing experience will contribute to teams in various different ways:

- Directly improves onboarding. New developers can understand code through hovers, go-to-definition, and diagnostics.
- Increases productivity for experienced teams. Fewer editor stalls and more accurate tooling.
- Lowers the cost of adopting Daml in new environments by enabling first-class support beyond VS Code.
- Helps teams scale to larger codebases by improving navigation (symbols, references) and reducing time spent searching for definitions.
- Improves reliability and trust in the IDE through stabler incremental builds and fewer editor hangs/crashes.
- Enables broader adoption by supporting common editor setups (VS Code, (Neo)Vim) so developers can use existing workflows.

In practice, better editor tooling translates into faster iteration, higher code quality, and a smoother developer experience across the ecosystem.

---

## Rationale

Ghcide has been forked in 2019, before HLS existed, and since then, the community has provided a comprehensible set of plugins and new LSP capabilities for it. Nowadays, the Ghcide repository is deprecated and moved to HLS’ repository, where the current language server grows around it.

Some alternatives include:

- Adding new features on top of the current ghcide fork: the status quo; this is the path taken since 2019 and Daml’s Ghcide has since drifted from upstream. We could instead implement new capabilities on top of it, but the engineering effort doesn’t seem worth it compared to porting 3 years of HLS work that already include various LSP capabilities plus plugins.
- Forking a newer HLS version: considered, but HLS is closely tied to the GHC API, and Damlc is built off GHC 8.8.1. `ghc-lib` only decouples the GHC version used to compile the tool from the GHC version the tool targets. Ghcide internals are written against a specific era of the GHC API. GHC 9.2 reorganized the API, and newer HLS releases have deleted this pre-GHC-9.2-reorganization scaffolding (flat modules, old exactprint annotations). Since Damlc is forked off GHC 8.8.1, we’d need to resurrect this scaffolding.
- Forking an older HLS version: what’s currently proposed. The motivation is given in the above point.
- Building a new language server from scratch: rejected, a new language server would have to rebuild everything that already exists in the current Ghcide fork and that HLS also builds from. This is genuinely hard work, and would waste engineering efforts without providing any of the benefits of Ghcide/HLS built over the last few years.

---

## Team

The team will consist of two senior compiler engineers (one also acting as team lead) and one project manager. We’ll also include one DevOps engineer on demand in case of complex build issues. The project will be supervised at a high level by Serokell’s CTO, with a QA team for the second half of engineering work (Milestones 3 and 4) and an adoption manager for Milestone 5 and co-marketing.

---

## Why Serokell

Since its inception 10 years ago, Serokell has had multiple Haskell-based projects, cultivating a team of Haskell experts, including members who are active GHC contributors and one ex-member of the GHC Steering Committee. Moreover, some of our team members are Daml-certified.

During this time, we developed various projects revolving around blockchains, compilers and their tooling, including:

- A [language server](https://gitlab.com/ligolang/ligo/-/tree/de5c2539a26098d16181ab9fa506fd40028e5507/lib/ligo_lsp) and [debugger](https://gitlab.com/ligolang/ligo/-/tree/de5c2539a26098d16181ab9fa506fd40028e5507/tools/debugger) for LIGO, including [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ligolang-publish.ligo-vscode), [Vim](https://gitlab.com/ligolang/ligo/-/tree/de5c2539a26098d16181ab9fa506fd40028e5507/tools/vim), and [Emacs](https://gitlab.com/ligolang/ligo/-/tree/de5c2539a26098d16181ab9fa506fd40028e5507/tools/emacs) extensions. We also developed a [web IDE](https://gitlab.com/ligolang/ligo/-/tree/de5c2539a26098d16181ab9fa506fd40028e5507/tools/webide-new) supporting the language server. During our language server work, we implemented [error-recovery for Menhir](https://github.com/serokell/ocaml-recovery-parser), a parser generator for OCaml.
- Multiple contributions to GHC, including the active development of Dependent Haskell.
- A compiler, debugger, and Visual Studio Code extension for Morley, a Haskell reimplementation of the Michelson language for Tezos.
- Multiple contributions to the Motoko Visual Studio Code extension, targeting new features and performance improvements. We also integrated our Menhir error-recovery improvements into their compiler.
- Development of the first version of Cardano node and wallet backend that were launched on mainnet.
- Baking and consensus tools for the Tezos blockchain.
- Development of many smart contracts for Ethereum, Solana, Tezos, TON, and Internet Computer.
