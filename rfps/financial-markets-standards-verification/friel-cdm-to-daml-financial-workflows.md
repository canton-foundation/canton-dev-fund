# Friel — From legal agreements to deployable Canton smart contracts

**Applicant and project lead** — Inveena Limited · Ciarán McGonagle · ciaran@inveena.com  
**RFP and lead SIG** — RFP 12, Daml and Institutional RWA Workflow Standards · Financial Workflows & Composability  
**Champion** — Needs Champion  
**Proposed funding and duration** — 1,447,000 CC over 24 weeks, including 12 weeks of maintenance

## The proposal

A lawyer reading a contract can tell whether a party **must** act, **may** act, or must wait for someone else to make a determination. Converting that clause into code requires someone to decide what triggers the action, who has authority and what happens if a condition is unmet. Friel gives the lawyer or financial product specialist a no-code environment in which to make, test and review those decisions. The starting point is the legal agreement itself.

A user uploads an agreement, selects the provisions to automate and reviews Friel’s interpretation against the source wording. Friel’s authoring tools turn those provisions into functions that can be tested individually and composed into a smart contract using the FINOS Common Domain Model (CDM). Inveena is seeking funding to translate the reviewed composition **directly into Daml** and demonstrate deployment of the generated contract on Canton. A change to a negotiated term should flow through this same process, from a lawyer’s review of the clause to a new, tested version of the Canton implementation.

The authoring method is designed for agreements across products and document types. Under RFP 12, we will publish the translation tools and demonstrate them with a collateral agreement and an interest-rate derivative. A Canton developer will be able to take a supported CDM composition, build and deploy its Daml implementation, and reproduce the reviewed scenarios using the public tools. [RFP 12](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#requests-for-proposals)

## From concept to construction to implementation

**Ciarán McGonagle, project lead.** For nearly ten years I have worked on how legal agreements can be translated into smart contracts while preserving their intended legal effect. At ISDA, I was a principal author of the smart derivatives contracts legal guidelines and white papers. One question in our 2018 paper, *Smart Derivatives Contracts: From Concept to Construction*, still drives my work: how can the lawyer responsible for an agreement validate what its automated terms will actually do? My subsequent work with Christopher Clack examined how events under the ISDA Master Agreement can affect automated payments and deliveries. [ISDA white paper](https://www.isda.org/2018/10/03/smart-derivatives-contracts-from-concept-to-construction/) · [ISDA legal guidelines](https://www.isda.org/2019/02/19/legal-guidelines-for-smart-derivatives-contracts-the-isda-master-agreement/) · [Clack and McGonagle on payments and deliveries](https://arxiv.org/abs/1904.01461)

Friel is my practical answer. A lawyer should be able to point to a clause, see the rule drawn from it, change an interpretation, and test a case where that choice matters. The CDM Smart Contract Task Force gives this process a shared technical foundation. Its **Instruction Composition** model expresses a workflow as ordered steps that carry state and produce an instruction. I will lead the work connecting the agreement wording to those steps and defining how lawyers review their legal effect through to the deployed Daml contract. [Task Force announcement](https://www.isda.org/?p=1152890) · [FINOS framework design](https://github.com/finos/common-domain-model/issues/4165) · [McGonagle on implementing digital standards](https://law.mit.edu/pub/if-we-build-it-will-they-come/release/1)

## What Friel can demonstrate today

The private application has ingested a PDF agreement, extracted its text and proposed a sequence of inputs and calculations for review. The author can draft and connect typed functions visually, review CDM mappings, run named scenarios and inspect the saved formula, inputs and result for a particular version. These stages give reviewers concrete points at which to question the interpretation.

In one demonstration, an exported four-step Credit Support Amount composition ran independently of Friel using a pinned CDM framework and a documented model extension. It matched six independently specified cases, including a zero amount and reversed party direction. A separate fictional invoice composition matched four cases. These are Rune/CDM executions. The proposed grant delivers and tests the direct Daml translation and Canton deployment.

## What the grant will build

1. **A reviewable path from clause to composition.** Record the source passage, the user’s interpretation, relevant definitions and elections, the CDM functions or steps, and scenarios chosen to distinguish plausible readings. A product specialist can specify the economics. The lawyer can amend the rule, require a further decision or record that the specified behaviour gives effect to the provision. Where the agreement reserves discretion, the model must identify who exercises it and what the contract must wait for.
2. **Direct generation of Daml.** Publish an open-source translator for an explicitly documented set of CDM Instruction Composition constructs. Its input is the versioned composition and reviewed decisions about parties, visibility and authority. Generate readable Daml, build a deployable Daml archive and link it to the reviewed source version. Report unsupported constructs at the relevant step. Check the composition against the pinned upstream model and identify any extensions the translation relies on.
3. **A reproducible Canton deployment.** Publish synthetic agreements, reviewed compositions, scenario expectations and instructions for deploying the generated packages into a local Canton environment. Execute the same scenarios against the source model and the deployed contract. Give reviewers the clause, the expected behaviour and the observed ledger result together. Keep private agreement text with the author. Publish the translator, examples and test harness so teams can build and exercise the packages independently of Friel.

For **collateral**, amend a threshold in a synthetic agreement and test cases below, at and above the threshold. For an **interest-rate derivative**, use a synthetic confirmation with a single-observation reset. If the wording gives the calculation agent discretion when the fixing is missing, the lawyer can check that the generated contract waits for the authorised determination. A test that simply produces a rate would expose a different legal effect. The Task Force’s reset work supplies an upstream reference for this example. Both demonstrations use the same translator. Each amended term receives a new review tied to the regenerated package. [FINOS reset composition](https://cdm.finos.org/docs/next/instruction-composition-reset/)

## Milestones and funding

The requested grant funds 82 person-days. Ciarán McGonagle will lead the legal, CDM and product work over 24 days (£30,000). This covers six days designing the review method, eight working through the two agreements, six reviewing the generated behaviour and exceptions, and four leading pilot acceptance. The balance funds 40 days of translator engineering, integration and deployment (£40,000), 12 days of independent review, pilot support and documentation (£12,000), and six days of maintenance (£6,000).

The sterling cost basis is **£88,000**. Milestone payments are requested in Canton Coin using a planning rate of £0.060806 per CC on 24 November 2026 and rounding each milestone to the nearest 1,000 CC. [CC/GBP reference](https://www.coingecko.com/en/coins/canton/gbp)

| Due | Deliverable and acceptance evidence | Funding |
|---|---|---:|
| Week 4 | Publish the supported CDM constructs, target Daml semantics and review format. For each synthetic agreement, a lawyer traces a provision to its interpretation, CDM steps and expected scenarios. A Daml reviewer checks the proposed party and authorisation model. | 337,000 CC |
| Week 9 | Generate Daml for both reviewed compositions, build the archives and deploy them to a pinned local Canton environment. Reproduce the source outcomes, exercise the party permissions, and show that an unsupported construct identifies the affected step and blocks the build. | 682,000 CC |
| Week 12 | A lawyer or product specialist amends a term through Friel and regenerates the package without editing Daml. An independent Canton team runs both scenario suites and integrates at least one generated package in its own application. Publish the deployment evidence, both examples and the integration guide. | 329,000 CC |
| Week 24 | Provide 12 weeks of maintenance. Triage issues, publish fixes, rerun the examples against supported versions and publish the compatibility and maintainer handover notes. | 99,000 CC |
| | **Total** | **1,447,000 CC** |

Inveena Limited will maintain the public repository and issue tracker. We are seeking a pilot team and a Tech & Ops champion through the Financial Workflows & Composability SIG. A pilot team’s ability to deploy the output independently, and a lawyer’s ability to trace a deployed behaviour back to the provision they reviewed, are the two measures of adoption we will report.
