## Development Fund Proposal

**Author:** IntellectEU
**Status:** Submitted  
**Created:** 2026-02-20 
**Label:** daml-tooling  
**Champion:** IntellectEU

---

## Abstract
This proposal requests a grant from the Development Fund to support the development by IntellectEU of AI-powered tools for Daml code autocompletion, code creation, and test generation. The resulting models will be released open-weight, and we will additionally build a federated-learning system that lets self-hosting organizations contribute to their continuous improvement without exposing their code. Together, these will facilitate the creation of new applications on the Canton Network by significantly lowering the barrier to entry for coding in Daml.

---

## Specification

### 1. Objective
Out-of-the-box solutions based on large language models (LLMs) have proven inadequate for generating syntactically and functionally correct Daml code because they have a limited amount of publicly available Daml code in their training data. The objective of this project is to develop three custom-built, benchmarked AI tools that outperform current state-of-the-art non-specialized LLMs:
1. **Daml code auto-completion tool:** This tool will act like a typical coding auto-completion tool (i.e. given all the characters in the code around the cursor, it suggests potential next characters), except that it has been trained specifically on Daml code, such that it is able to much more accurately generate syntactically correct code.
2. **Daml code creation tool:** Given a description of a use case in natural language, pseudocode, and/or test code, the Daml code creation tool will generate the corresponding Daml implementation files.
3. **Daml test generation tool:** Given existing Daml implementation files and/or a natural language description of intended behavior, this tool will generate Daml tests that compile, pass against the correct implementation, and catch realistic bugs or regressions.

All models produced will be released open-weight. A federated-learning system (Milestone 4) will let self-hosting organizations contribute to training without their code leaving their premises, giving the ecosystem a dedicated Daml model that keeps improving as more Daml is written while each participant's code stays private.

### 2. Implementation Mechanics
We will deliver this project in three distinct technical phases (Milestones 1-3) and the build-out of a federated-learning system (Milestone 4) that lets self-hosting organizations contribute to continuous improvement, followed by a maintenance phase (Milestone 5).

Each technical phase consists of creating a relevant benchmark, developing an AI tool that outperforms existing off-the-shelf solutions on that benchmark, and packaging the resulting AI tool so it is available for Daml developers to use.

As a basis for benchmarks and training sets, we use Daml code from a mix of public and private Daml repositories that we have gathered, amounting to 4M+ tokens of Daml code. We will ensure the model is trained to deal with Smart Contract Upgrades (SCUs), by including training and evaluation data that contains examples of contracts that have been upgraded in an SCU-compatible way, or are designed with later SCU in mind.

The maintenance phase consists of maintenance and hosting of the AI tools on the one hand, and of the benchmarks on the other hand.

- **Part 1: Autocompletion:**
  - <u>Benchmark:</u> We will measure autocompletion quality in two ways: how often the tool's prediction exactly matches an existing masked-out Daml code substring, and how often developers accept autocompletions from the tool.
  - <u>Improvement over existing:</u> We will fine-tune an open-source coding model on a training dataset constructed similarly to the test set, ensuring that there is no overlap in repositories between training and test set to avoid overestimating accuracy. We will iteratively improve the dataset and model design based on the benchmark results until we reliably outperform the SOTA non-specialized LLMs. Results of testing so far already indicate we could improve exact-match accuracy from 31% (GitHub Copilot, which used gpt-41-copilot under the hood at time of testing, mid-March 2026) to 37%.
  - <u>Packaging:</u> We will set up a server where the model can respond to inference calls using vLLM. We will develop an IDE plugin (VS Code) that communicates between the IDE and the server to allow the user to get completions on demand. We will also provide documentation for self-hosted deployments.
- **Part 2: File Creation (Agentic Generation):**
  - <u>Benchmark:</u> Based on the same set of Daml repositories as milestone 1, we are creating a benchmark as follows: we start from test suites in these repositories that are designed to test a certain number of Daml implementation files. We then verify whether an agentic model can generate these implementation files from scratch, while having access to relevant context (such as other files in the repository) and relevant tools (such as the ability to run Daml compilation and testing), within some fixed time limit. We then report the pass rate of test suites, of individual tests, the rate at which compilable code was produced, and the rate at which code without syntax errors was produced. As discussed in the Motivation section later, initial tests on this benchmark indicate GPT 5.4 is able to solve 15/24 (62.5%) of test suites within a 10-minute time limit.
  - <u>Improvement over existing:</u> Unlike for the more contained task of autocompletion, we estimate that fine-tuning a custom agentic model to completely replace SOTA models is not feasible. Instead, we will develop smaller, Daml-finetuned models that can be called as specialized subroutines by existing agentic LLMs, via the Model Context Protocol (MCP), to reduce the time and money spent by agentic LLMs on getting Daml peculiarities right. These models will be trained with Reinforcement Learning from Execution Feedback (RLEF) to produce syntactically correct and compilable code. The agent will be able to call these tools both to write files from scratch and to correct files that lead to syntax errors, compilation errors, or failing tests.
  - <u>Packaging:</u> We will set up an MCP server and vLLM server on a GCP Virtual Machine, to which coding agents will be able to connect. We will also provide documentation for self-hosted deployments.
- **Part 3: Test Generation:**
  - <u>Benchmark:</u> We will create a benchmark that evaluates whether a tool can generate useful Daml tests for existing implementation files and/or natural-language behavioral descriptions. Generated tests will be evaluated on whether they compile, pass against the correct implementation, and catch realistic seeded bugs or regressions.
  - <u>Improvement over existing:</u> We will develop Daml-finetuned MCP tools that help agentic LLMs generate and refine test files. We will use execution feedback from `daml build`, `daml test`, and mutation-style benchmark runs to train and improve Daml-specific test-generation tools. The reward signal will favor tests that compile, pass against the correct implementation, and fail against realistic seeded bugs/regressions.
  - <u>Packaging:</u> We will expose the test-generation capability through the same hosted MCP/vLLM architecture as Part 2, so coding agents can call it from an IDE or benchmark harness. As with Part 2, documentation for self-hosted deployments will be made available.
- **Part 4: Federated Learning System:** Most production Daml lives in private repositories that off-the-shelf models never see. To let the organizations holding that code contribute to model improvement without it leaving their premises, we will build a federated-learning system. This involves:
  - <u>On-premise data gathering:</u> Client-side code that automatically assembles local training data from ordinary development signals (for example, accepted/rejected completions and `daml build`/`daml test` outcomes), so that participation requires minimal manual effort.
  - <u>Local training & weight-update sharing:</u> A client-side training harness that fine-tunes the model locally for a small number of gradient steps, using both reinforcement learning from the gathered interaction data and/or supervised fine-tuning on the participant's existing Daml code, then shares only the resulting weight updates (not code or data) with our aggregation server.
  - <u>Secure aggregation:</u> A coordination server that authenticates participants, aggregates incoming weight updates (e.g., via federated averaging) into improved central models, and is robust to low-quality or malicious updates.
  - <u>Opt-in & incentives:</u> An opt-in mechanism and the associated access control that grants participating organizations discounted access to the resulting improved models.
  - <u>Privacy:</u> Guarantees that raw Daml code never leaves a participant's premises; we will additionally evaluate protections such as differential privacy on the shared weight updates.
  - <u>Packaging:</u> Documentation and packaging so that self-hosting organizations can deploy the federated-learning client alongside their open-weight model deployment.
- **Part 5: Models & benchmark Maintenance & Long-Term Sustainability:**
  - **Model access:** The models developed under this grant will be released as **open-weight**: we will publish the trained model weights for anyone to download and self-host, under a license that adopts Business Source License (BSL) / Commons-Clause-style terms that permit internal self-hosting free of charge while prohibiting offering the models as a competing hosted service. The exact license text will be finalized before the first model release. Concretely, there will be two ways of accessing the models: hosted API access, and self-hosted deployment of the open-weight models. During at least the 12-month bootstrapping period corresponding to Milestone 5, we will provide hosted API access free of charge to Canton/Daml developers, subject to the fair-use and rate-limiting controls described below.
    - **API access:** Hosted API usage will be free during at least the 12-month Milestone 5 bootstrapping period, but bounded by rate limits and usage quotas. These limits will be applied per user and, where relevant, per organization, so that capacity is not dominated by a small number of high-volume users and so that aggregate infrastructure spend remains roughly within the Milestone 5 operating budget. After the bootstrapping period, hosted API access may be charged commercially.
    - **Self-hosted access:** Because the models are open-weight under the license described above, any organization can deploy them in-house free of charge for their own internal use.
  - **Continuous improvement:** Rather than ship a single frozen checkpoint, we will keep improving the models from real usage through two complementary, opt-in feedback sources; participants in either are rewarded with discounted access to the resulting improved models:
    - **API-based learning:** Hosted-API users can opt in to let us train on their usage data (accepted/rejected completions and `daml build`/`daml test` outcomes) under clear data-handling terms, with n-gram output filtering to guard against regurgitating sensitive snippets.
    - **Federated learning:** Self-hosting organizations can opt into the Milestone 4 federated-learning system, contributing on-premise training updates without their code ever leaving their premises.

    Whenever our benchmarks show an improvement, we update the hosted model accordingly.
  - **Operational controls for hosted access:** We will enforce per-user and, where applicable, per-organization request and token limits, with separate quotas for model inference and benchmark submissions. These limits are intended to preserve availability for ordinary ecosystem use, prevent a small number of high-volume users from consuming shared capacity, and reduce resource-abuse risk. During Milestone 5, we will monitor usage, latency, error rates, and infrastructure spend, and adjust limits as needed to keep hosted usage within the infrastructure budget funded by the milestone.
  - **Benchmark access:** In addition to model hosting, we will maintain the evaluation infrastructure. We will open-source our evaluation scaffolding along with a subset of the benchmark dataset derived from public repositories. For the benchmark subset based on private repositories, we will make a Zero-Retention Evaluation API available. This allows model developers to evaluate their models against our private datasets without exposing the proprietary Daml code, and guarantees that their submitted code is not retained. Model developers can reach out to us to make use of this API.

### 3. Architectural Alignment
This project directly aligns with the Canton ecosystem's primary strategic goal: driving network adoption by lowering the barrier to entry for developers. Because Daml is a specialized, purpose-built smart contract language, the learning curve can be steep for traditional Web2 and Web3 developers. By providing intelligent, context-aware coding assistants, we align with the Foundation's priority of expanding the developer ecosystem and accelerating time-to-market for Canton applications.

### 4. Backward Compatibility
No backward compatibility impact.

---

## Milestones and Deliverables
Each of the three tool milestones (Milestones 1-3) is split into two acceptance tranches: a **Benchmark Tranche** representing 40% of that milestone's funding, and a **Tool Tranche** representing 60% of that milestone's funding. The Benchmark Tranche rewards delivery of a reusable benchmark and baseline evaluation asset. The Tool Tranche rewards delivery of the corresponding AI tool and demonstrated improvement over the agreed baseline set on that benchmark. Milestone 4 (the federated-learning system) is paid as a single amount on acceptance, and Milestone 5 (maintenance and federated-learning operation) is a recurring monthly amount paid quarterly based on actual resource usage.

### Milestone 1: Daml code auto-completion benchmark and tool
- **Estimated Delivery:** +45 Days from CIP Approval
- **Focus:** Core syntax learning, benchmarked autocompletion evaluation, and IDE plugin development.
- **Benchmark Tranche Deliverables / Value Metrics:** Deliver the source code used to create the Daml autocompletion benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
- **Tool Tranche Deliverables / Value Metrics:** Demonstrate improvement over the agreed baseline set on the agreed benchmark, deliver the autocompletion tool as an API with UI or IDE integration, and provide documentation for self-hosted deployments.

### Milestone 2: Daml code creation benchmark and tool
- **Estimated Delivery:** +105 Days from CIP Approval
- **Focus:** Benchmarking and improving generation and iterative repair of full Daml files from natural language prompts, tests, or pseudocode.
- **Benchmark Tranche Deliverables / Value Metrics:** Deliver the source code used to create the Daml code-generation benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
- **Tool Tranche Deliverables / Value Metrics:** Demonstrate improvement over the agreed baseline set on the agreed benchmark, deliver the code creation tool as an API with UI or IDE integration, and provide documentation for self-hosted deployments.

### Milestone 3: Daml test generation benchmark and tool
- **Estimated Delivery:** +135 Days from CIP Approval
- **Focus:** Benchmarking and improving generation of high-quality Daml tests for existing code and intended behavior.
- **Benchmark Tranche Deliverables / Value Metrics:** Deliver the source code used to create the Daml test-generation benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
- **Tool Tranche Deliverables / Value Metrics:** Demonstrate improvement over the agreed baseline set on the agreed benchmark, deliver the test generation tool as an API with UI or IDE integration, and provide documentation for self-hosted deployments.

### Milestone 4: Federated learning system
- **Estimated Delivery:** +240 Days from CIP Approval
- **Focus:** Building an opt-in federated-learning system that lets self-hosting organizations contribute to continuous model improvement without exposing their Daml code.
- **Deliverables / Value Metrics:** Deliver the federated-learning system supporting multiple participating organizations: automated on-premise gathering of local training data from development signals, local training that produces weight updates shared without exposing code, central aggregation that produces improved models, participant authentication, robustness to low-quality or malicious updates, the opt-in mechanism granting participants discounted access to improved models, privacy guarantees that no code leaves participants' premises, and packaging/documentation for self-hosted deployment; demonstrated by an end-to-end federated round across at least two controlled client deployments holding Daml data withheld from central training, in which the aggregated model measurably improves on an evaluation reflecting that withheld data, confirming the loop transfers learning from local data without that data being centrally pooled.

### Milestone 5: Maintenance & Bootstrapping Runway
- **Estimated Delivery:** Recurring monthly for 12 months post-launch
- **Focus:** Server uptime, minor bug fixes, user support, continuous model retraining, free hosted API access during the bootstrapping period, self-hosted deployment support, and benchmark API hosting.
- **Deliverables / Value Metrics:** Ongoing hosting and sustained API availability for both the models and the benchmark APIs; free hosted API access during the bootstrapping period subject to fair-use limits; periodic model updates from continuous retraining; operation of the Milestone 4 federated-learning system once it is live (coordinating aggregation rounds, validating updates, and benchmarking and releasing improved models); and updated deployment materials for self-hosted users.

---

## Acceptance Criteria
**Project-Specific Acceptance Conditions:**

For each of the three tool milestones (Milestones 1-3), acceptance is split into a Benchmark Tranche and a Tool Tranche. Milestones 4 and 5 each have a single set of acceptance conditions, stated below.

**Benchmark Tranche acceptance** requires IntellectEU to deliver the source code used to create the benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results. The benchmark and baseline results become the agreed basis for the Tool Tranche evaluation.

**Tool Tranche acceptance** requires IntellectEU to deliver the corresponding AI tool and meet or exceed the agreed minimum improvement threshold over the agreed SOTA non-specialized LLM baseline set on the accepted benchmark. Because the appropriate threshold depends on the baseline established under the Benchmark Tranche, the specific minimum is set relative to those agreed baseline results rather than fixed in advance. As an illustration of the kind of margin involved, our preliminary autocompletion work already improves exact-match accuracy from 31% (GitHub Copilot baseline) to 37%.

- **Milestone 1** 
    - **Benchmark Tranche:** Deliver the source code used to create the agreed Daml autocompletion benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
    - **Tool Tranche:** On the agreed Daml autocompletion benchmark, the tool must meet or exceed the agreed minimum improvement threshold over the agreed SOTA non-specialized LLM baseline set on exact-match accuracy for unseen Daml completions and/or developer acceptance rate of suggested completions.
- **Milestone 2**
  - **Benchmark Tranche:** Deliver the source code used to create the agreed Daml code-generation benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
  - **Tool Tranche:** On the agreed Daml code-generation benchmark, the tool must meet or exceed the agreed minimum improvement threshold over the agreed SOTA non-specialized LLM baseline set, either by improving test-suite pass rate, individual-test pass rate, syntax-error-free generation rate, or build-success rate, or by achieving comparable quality with lower average runtime, fewer repair iterations, or lower token/API cost.
- **Milestone 3**
  - **Benchmark Tranche:** Deliver the source code used to create the agreed Daml test-generation benchmark, including the evaluation code and UI visualization code, the subset of testing samples evaluated on that come from public repositories, and the baseline results.
  - **Tool Tranche:** On the agreed Daml test-generation benchmark, the tool must meet or exceed the agreed minimum improvement threshold over the agreed SOTA non-specialized LLM baseline set on generated-test compile/pass rate and/or seeded bug/regression detection rate.
- **Milestone 4:** Deliver the federated-learning system supporting multiple participants, with automated on-premise gathering of local training data from development signals, local training that produces weight updates shared without exposing code, central aggregation, participant authentication, robustness to low-quality or malicious updates, an opt-in mechanism granting participants discounted access to improved models, a guarantee that raw Daml code never leaves participants' premises, and deployment documentation. Acceptance requires demonstrating an end-to-end federated round across at least two controlled client deployments that hold Daml data withheld from central training, in which the aggregated model measurably improves on an evaluation reflecting that withheld data relative to the pre-round model, confirming that the federated loop transfers learning from local data without that data being centrally pooled.
- **Milestone 5:** Maintain an API Uptime greater than the agreed upon minimum percentage, provide hosted API access free of charge during the bootstrapping period subject to fair-use and cost-control limits, provide periodic updated deployment materials to self-hosted users, and maintain continuous model improvement based on benchmarked retraining (including, once operational, via the Milestone 4 federated-learning system).

---

## Funding

*For detailed technical and labor assumptions underlying these figures, see **Appendix A: Detailed Budget & Technical Assumptions**.*

**Total Funding Request:** 6,997,227 CC, inclusive of all infrastructure, personnel, 12 months of post-launch bootstrapping and free hosted API access subject to fair-use limits, and the build-out and operation of the federated-learning system.

### Payment Breakdown by Milestone and Tranche
*(Note: USD equivalents listed below are for budgeting and calculation logic; actual payouts to be converted to CC per Foundation guidelines.)*

Each of the three tool milestones (Milestones 1-3) is paid in two tranches: 40% upon acceptance of the benchmark deliverable and 60% upon acceptance of the corresponding AI tool and its demonstrated improvement over the agreed baseline set on the accepted benchmark. Milestone 4 is paid as a single amount on acceptance; Milestone 5 is a recurring monthly amount paid quarterly based on actual resource usage.

- **Milestone 1 (Daml code auto-completion benchmark and tool):** 546,809 CC total (Equivalent to 90,224 USD)
  - **Benchmark Tranche:** 218,724 CC (Equivalent to 36,089 USD) upon benchmark acceptance
  - **Tool Tranche:** 328,085 CC (Equivalent to 54,134 USD) upon tool release and benchmark-based acceptance
- **Milestone 2 (Daml code creation benchmark and tool):** 548,672 CC total (Equivalent to 90,531 USD)
  - **Benchmark Tranche:** 219,469 CC (Equivalent to 36,212 USD) upon benchmark acceptance
  - **Tool Tranche:** 329,203 CC (Equivalent to 54,318 USD) upon tool release and benchmark-based acceptance
- **Milestone 3 (Daml test generation benchmark and tool):** 548,672 CC total (Equivalent to 90,531 USD)
  - **Benchmark Tranche:** 219,469 CC (Equivalent to 36,212 USD) upon benchmark acceptance
  - **Tool Tranche:** 329,203 CC (Equivalent to 54,318 USD) upon tool release and benchmark-based acceptance
- **Milestone 4 (Federated learning system):** 3,312,126 CC (Equivalent to 546,501 USD) upon acceptance of the federated-learning system.
- **Milestone 5 (Maintenance & federated-learning operation):** 170,079 CC / month (Equivalent to 28,063 USD / month for 12 months) paid quarterly based on actual resource usage. In addition to baseline maintenance and hosting, this includes operation of the federated-learning system (coordination/aggregation infrastructure plus the labor to run aggregation rounds, validate updates, and benchmark and release improved models).

### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark based on the then-current USD/CC exchange rate. If significant volatility is observed, remaining milestone payouts should be adjusted by agreement with the Committee.

---

## Co-Marketing & Non-Monetary Asks
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

**Additional Non-Monetary Commitments / Asks:**
- **Data Access:** To ensure the model achieves the highest possible accuracy, we request that Digital Asset and the Foundation provide access to private/internal Daml code repositories to augment our training dataset.
- **Rationale:** Our current dataset contains ~4M tokens. Access to vetted, high-quality internal DA code would significantly improve the model's "Ground Truth" understanding and performance, directly benefiting the ecosystem.

---

## Motivation
Why is this valuable to the Canton ecosystem?
The proposal ties funding milestones to the delivery of specific, benchmarked AI tools that outperform current State-of-the-Art (SOTA) non-specialized LLMs in three key areas: Autocompletion, File Creation, and Test Generation.

To better estimate the demand for AI tools among Daml developers, we did a small survey (15 respondents), which shows that there is indeed demand for better AI tooling as discussed below.

For Autocompletion, we have already developed an internal benchmark and fine-tuned model that indicates it is feasible to get more accurate predictions than off-the-shelf models. Specifically, fine-tuning an open-source model to do Fill-in-the-middle prediction improved exact-match accuracy from 31% (GitHub Copilot, which used gpt-41-copilot under the hood at time of testing, mid-March 2026) to 37%.

Survey results indicated that while a minority currently uses in-line autocompletion for Daml development (7%), almost half of respondents (47%) said that more accurate in-line autocompletion is an important property that would make them use AI tooling more.

For File Creation, we created another benchmark to evaluate agentic performance on Daml. Evaluating codex with GPT 5.4 as model, we gave the agent 10 minutes to create the implementation files corresponding to test files in real projects, while having access to feedback from being able to run `daml build` and `daml test` itself. The model succeeded in passing the test suite in 15/24 suites; while this is impressive, it does show there is still room for improvement. We also evaluated the effect of giving the model access to a Daml skill (https://github.com/zenith-network/daml-skill). This did not change how many test suites passed, though it slightly increased the number of individual tests passed.

Within the 10 minute timeout, the API cost was on average 2 USD per test suite attempt.

While this does not guarantee that a Daml-finetuned tool will help, it suggests that prompt engineering only (such as with the skill) isn't enough to bridge the remainder of the gap. Moreover, if such a tool reduces the number of iterations an agent requires, it will also reduce the API cost.

Survey results showed high appetite for AI tools that could write full files. "Automated test generation" was an important property for AI tooling for 67% of respondents, while "Correct Daml code generation from plain English" was so for 60%.

For Test Generation, we have not yet developed a benchmark. However, survey results show high demand for this capability, with 67% of respondents marking "Automated test generation" as an important property for AI tooling.

---

## Rationale

To deliver a highly accurate Daml coding assistant, we made the following design decisions.

**IDE extension:** We chose to deliver these tools primarily as IDE extensions (e.g., VS Code) rather than standalone web chat interfaces to integrate directly into the developer's existing workflow. Context-aware autocompletion, agentic file generation, and test generation require real-time access to the local codebase, which a web interface cannot seamlessly provide. This design decision minimizes developer friction and maximizes daily active usage.

**Fine-tuning Instead of Prompt Engineering:** We evaluated whether state-of-the-art proprietary models could be sufficiently improved using advanced prompt engineering, such as providing them with a specialized Daml skill. However, our benchmarks showed that this approach provided only limited benefits. Because Daml is underrepresented in the base training data of these models, prompt engineering alone is insufficient to reliably produce compilable code. Fine-tuning specialized models is necessary to bridge this gap.

**MCP Server Tools Instead of a Standalone Agent:** For the file and test generation tasks, building an end-to-end agentic model from scratch that matches the general reasoning capabilities of the most powerful off-the-shelf models is an unfeasibly large task. Instead, we are packaging our fine-tuned models as specialized tools exposed via the Model Context Protocol (MCP). This allows us to leverage the reasoning power of existing state-of-the-art agents while augmenting them with Daml-specific capabilities where they fall short.

**Federated Learning to Capture Private Daml Data:** Most production Daml lives in private repositories at banks and financial institutions, which are not in any public crawl and so are absent from off-the-shelf models' training data. Federated learning lets these organizations contribute to training without their code leaving their premises: they train locally and share only weight updates. This gives our models access to Daml data that off-the-shelf models cannot reach, which stays valuable even as base models improve.

---

## Appendix A: Detailed Budget & Technical Assumptions

This appendix outlines the specific technical and labor assumptions used to calculate the funding requests for the Daml Agent project. Costs are divided into **Infrastructure** (Compute/Storage) and **Personnel** (Development/Maintenance).

### **A.1 Infrastructure Cost Assumptions**

Infrastructure estimates are derived from standard **GCP** (Google Cloud Platform) pricing. Costs are categorized into **Development** (Training/Fine-tuning) and **Production** (Hosting/Inference).

#### **1. Development Infrastructure (Fixed Costs)**

These costs cover the GPU compute required to fine-tune the models for each milestone.

- **M1 (Autocompletion):** Involves running experiments on a g2-standard-8 (L4 GPU) instance during 5 weeks.
- **M2 & M3 (Agentic Tools):** Require running experiments on a powerful a2-highgpu-1g (A100 GPU) during 4 weeks per milestone.
- **M4 (Federated Learning):** Requires an a2-highgpu-1g (A100 GPU) for aggregation/local-training development, plus several small VMs to simulate multiple federated clients (folded into the compute cost below), over 4 weeks.

| Cost Component | M1: Autocompletion | M2: File Creation | M3: Test Generation | M4: Federated Learning |
| --- | --- | --- | --- | --- |
| Duration (GPU Usage) | 5 Weeks | 4 Weeks | 4 Weeks | 4 Weeks |
| Compute Cost (VM) | 106.25 USD | 367.00 USD | 367.00 USD | 487.00 USD |
| Storage Costs | 17.31 USD | 13.85 USD | 13.85 USD | 13.85 USD |
| API Costs* | 100.00 USD | 150.00 USD | 150.00 USD | 0.00 USD |
| Total Dev Infra Cost | 223.56 USD | 530.85 USD | 530.85 USD | 500.85 USD |

*Note: API costs cover benchmarking calls to SOTA off-the-shelf models (e.g., Gemini, Claude, GPT) to validate performance improvements.*

#### **2. Production Hosting (Recurring Variable Costs)**

Hosting costs are requested on a quarterly basis as they are ongoing operational expenses.

- **M1 (Autocompletion):** Uses a smaller ~3B parameter LLM, sufficient for syntax completion.
- **M2/M3 (Agentic Tools):** Expected to require bigger specialized models (e.g., ~7B parameters) to outperform off-the-shelf solutions, resulting in higher resource usage.

| Metric | M1 (Autocompletion) | M2 & M3 (Agentic Tools) |
| --- | --- | --- |
| Model Size (Est.) | ~3B Parameters | ~7B Parameters |
| Active Users (Est.) | 200 daily active users | 200 daily active users |
| Throughput Req. | 667 tokens/sec | 3,333 tokens/sec |
| Monthly Est. | ~620.50 USD | ~2,921.24 USD |

Once the Milestone 4 system is operational, Milestone 5 additionally funds the federated-learning operating infrastructure: an aggregation/coordination server (GPU time for aggregating weight updates and benchmarking the resulting models, an always-on coordinator, and delta/checkpoint storage), estimated at ~2,400 USD/month.

---

### **A.2 Personnel & Labor Assumptions**

Labor costs are calculated based on a standard team composition required to deliver enterprise-grade AI tools, including backend integration and DevOps. All labor calculations assume a blended rate of **$150 USD/hour** (equivalent to $1,200 USD per 8-hour man-day). This blended rate is inclusive of overhead and project management; milestone amounts are therefore quoted at cost without a separate profit margin, and contingency and validation buffers are folded into the per-milestone week counts below.

#### **1. Team Composition**

- **AI Engineers:** Responsible for model training, benchmarking, adaptation, and the federated-learning training pipelines.
- **Backend Developers:** Up to two for the tool milestones, front-loaded in Milestone 1 to build the shared serving, IDE, and MCP infrastructure reused in Milestones 2-3; scaling to three for the federated-learning system.
- **DevOps Engineer:** Engaged for deployment and infrastructure setup.
- **Security/Privacy Engineer:** Engaged for the federated-learning system (aggregation security and differential-privacy review).

#### **2. Milestone Breakdown**

The project timeline includes buffers for contingency and user validation to ensure high-quality deliverables.

The labor assumptions below reflect the total estimated effort for the milestone, including work already performed before CIP approval.

- **M1: Autocompletion (16 Weeks)**
  - **Focus:** Core syntax learning and IDE plugin development.
  - **Breakdown:** 5 weeks Model Adaptation + 4 weeks Backend + 1 week Deployment + 2 weeks Validation + 4 weeks Contingency.
  - **FTE Allocation:** AI Engineer (11 wks), Backend (3 wks), DevOps (1 wk) = 15 FTE-weeks.
  - **Total Labor:** 90,000 USD
- **M2: File Creation (14 Weeks)**
  - **Focus:** Generating and iterating on full Daml files from natural language prompts, tests, or pseudocode.
  - **Breakdown:** 4 weeks Model Benchmarking/Adaptation + 8 weeks Development + 2 weeks Contingency.
  - **FTE Allocation:** AI Engineer (13 wks), Backend (1 wk), DevOps (1 wk) = 15 FTE-weeks.
  - **Total Labor:** 90,000 USD
- **M3: Test Generation (14 Weeks)**
  - **Focus:** Generating high-quality Daml tests for existing code and intended behavior.
  - **Breakdown:** 4 weeks Model Benchmarking + 8 weeks Development + 2 weeks Contingency.
  - **FTE Allocation:** AI Engineer (13 wks), Backend (1 wk), DevOps (1 wk) = 15 FTE-weeks.
  - **Total Labor:** 90,000 USD
- **M4: Federated Learning System (Build, 22 Weeks)**
  - **Focus:** Building the opt-in federated-learning system: on-premise data gathering, local training (reinforcement learning from interaction data and supervised fine-tuning on existing code) and weight-update sharing, secure aggregation robust to malicious updates, differential-privacy protections, the opt-in/incentive and access-control layer, and packaging/documentation.
  - **FTE Allocation:** AI Engineer (2 FTE * 22 wks), Backend (3 FTE * 12 wks), DevOps (8 wks), Security/Privacy Engineer (3 wks) = 91 FTE-weeks.
  - **Total Labor:** 546,000 USD
- **M5: Maintenance & Federated-Learning Operation (Ongoing)**
  - **Focus:** Server uptime, minor bug fixes, user support, free hosted API access during the bootstrapping period subject to fair-use limits, continuous model retraining, self-hosted deployment support, and operation of the federated-learning system (coordinating aggregation rounds, validating weight updates, and benchmarking and releasing improved models).
  - **Resource:** ~16 man-days per month (~8 for baseline maintenance, ~8 for federated-learning operation).
  - **Cost:** 19,200 USD/month labor (230,400 USD/year), plus ~2,400 USD/month federated-learning operating infrastructure and ~6,463 USD/month baseline model hosting (see A.1), for ~28,063 USD/month all-in.
