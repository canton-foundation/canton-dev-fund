## Development Fund Proposal

**Author:** IntellectEU NV  
**Status:** Submitted  
**Created:** 2026-02-20 

---

## Abstract
This proposal requests a grant from the Development Fund to support the development by IntellectEU of AI-powered tools for generating and parsing Daml code. These tools will facilitate the creation of new applications on the Canton Network by significantly lowering the barrier to entry for coding in Daml.

---

## Specification

### 1. Objective
Out-of-the-box solutions based on large language models (LLMs) have proven inadequate for generating syntactically and functionally correct Daml code because they have a limited amount of publicly available Daml code in their training data. The objective of this project is to develop three custom-built, benchmarked AI tools that outperform current state-of-the-art non-specialized LLMs:
1. **Daml code auto-completion tool:** This tool will act like a typical coding auto-completion tool (i.e. given all the characters in the code around the cursor, it suggests potential next characters), except that it has been trained specifically on Daml code, such that it is able to much more accurately generate syntactically correct code.
2. **Daml code creation tool:** Given a description of a use case in natural language, pseudocode, and/or test code, the Daml code creation tool will generate the corresponding Daml smart contract.
3. **Daml code improvement tool:** Given an existing Daml smart contract and optionally a description of its intended use case, this tool will flag potential issues (e.g. if in some case the smart contract may not behave as expected) or suggest potential improvements (e.g. to lower the transaction fees).

### 2. Implementation Mechanics
We will deliver this project in three distinct technical phases, followed by a maintenance phase:
* **Part 1: Autocompletion:** We will fine-tune an open-source coding model making use of the 4M+ tokens of Daml code we have gathered. We will iteratively improve the dataset and model design based on the benchmark results until we reliably outperform the SOTA non-specialized LLMs. This fine-tuning will involve Generic Next-Token-Prediction (NTP) on Daml code, Fill-In-The-Middle (FIM) specific NTP training, and Reinforcement Learning from Execution Feedback (RLEF), depending on technical efficacy during testing. Once we have satisfactory benchmark performance, we will set up a server where the model can respond to inference calls. We will develop an IDE plugin (VS Code) that communicates between the IDE and the server to allow the user to get completions on demand. Once packaged, we will evaluate the acceptance rate of suggestions by actual Daml Engineers to verify utility.
* **Part 2: File Creation (Agentic Generation):** Similar to Part 1, we will train the model to handle larger context windows and logical structuring required for full file generation. This will be packaged as an IDE extension similar to agentic tools like Cline, allowing users to describe a module and have the file generated.
* **Part 3: Code Improvement (Bug & Resource Detection):** We will train on a dataset of known "bad patterns" vs "good patterns" in Daml to sharpen the model's critical analysis capabilities. This will be packaged as an IDE extension that runs a linter-style pass over the code to suggest improvements.
* **Part 4: Maintenance & Long-Term Sustainability:** To ensure the long-term economic viability of the Daml Agent without perpetual reliance on direct grants, we will integrate the Canton Network's native reward mechanism directly into the inference loop. The tools will be engineered to generate Featured Application Activity Markers based on utility usage, specifically by metering the volume of prompt and completion tokens generated. Upon reaching a defined usage threshold (e.g., per X million tokens produced), the agent will trigger the creation of a FeaturedAppActivityMarker, which converts into an AppRewardCoupon to mint Canton Coin (CC), thereby offsetting the computational costs of the inference servers. However, as this revenue model depends on a critical mass of active daily users to break even against high-performance GPU costs, we request fixed funding to cover hosting and maintenance for an initial 12-month bootstrapping period. This runway allows us to scale the user base and optimize the token-to-reward ratio until the system becomes self-sustaining through network activity rewards.

### 3. Architectural Alignment
This project directly aligns with the Canton ecosystem's primary strategic goal: driving network adoption by lowering the barrier to entry for developers. Because Daml is a specialized, purpose-built smart contract language, the learning curve can be steep for traditional Web2 and Web3 developers. By providing intelligent, context-aware coding assistants, we align with the Foundation's priority of expanding the developer ecosystem and accelerating time-to-market for Canton applications.

### 4. Backward Compatibility
No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: Daml code auto-completion tool
- **Estimated Delivery:** +90 Days from CIP Approval 
- **Focus:** Core syntax learning and IDE plugin development. 
- **Deliverables / Value Metrics:** Deliver the tool as an API with UI or IDE integration. 

### Milestone 2: Daml code creation tool
- **Estimated Delivery:** +150 Days from CIP Approval  
- **Focus:** Generating full Daml files from natural language prompts.  
- **Deliverables / Value Metrics:** Deliver the tool as an API with UI or IDE integration.

### Milestone 3: Daml code improvement tool
- **Estimated Delivery:** +180 Days from CIP Approval  
- **Focus:** Bug detection and resource-optimization review capabilities.  
- **Deliverables / Value Metrics:** Deliver the tool as an API with UI or IDE integration.

### Milestone 4: Maintenance & Bootstrapping Runway
- **Estimated Delivery:** Recurring monthly for 12 months post-launch
- **Focus:** Server uptime, minor bug fixes, and user support.
- **Deliverables / Value Metrics:** Ongoing hosting, model updates, and sustained API availability.

---

## Acceptance Criteria
**Project-Specific Acceptance Conditions:**
* **Milestone 1:** On a predefined collection of test cases gathered from entities on the network, the acceptance rate of the tool’s suggestions must be above 20% and at least 5% better than SOTA non-specialised LLMs. The tool's suggestions must match the ground truth in unseen Daml files at least 20% of the time and at least 5% more often than SOTA non-specialised LLMs.
* **Milestone 2:** On Foundation-provided use cases, the fraction of generated smart contracts with syntax errors, build errors, or failing tests must each be below 5% (and at least 10% lower than SOTA non-specialised LLMs).
* **Milestone 3:** On smart contracts with introduced bugs/suboptimal usage, the fraction of detected bugs must be >90% and resource improvements >70% (both at least 10% above SOTA non-specialised LLMs).
* **Milestone 4:** Maintain an API Uptime >99% and continuous model improvement based on user acceptance.

---

## Funding

*For detailed technical and labor assumptions underlying these figures, see **Appendix A: Detailed Budget & Technical Assumptions**.*

**Total Funding Request:** 3,051,329 CC (Equivalent to approximately 494,315 USD at 0.162 USD/CC, inclusive of all infrastructure, personnel, and 12 months of post-launch maintenance).

### Payment Breakdown by Milestone
*(Note: USD equivalents listed below are for budgeting and calculation logic; actual payouts to be converted to CC per Foundation guidelines.)*
- **Milestone 1 (Daml code auto-completion tool):** 762,037 CC (Equivalent to 123,450 USD) upon committee acceptance
- **Milestone 2 (Daml code creation tool):** 843,056 CC (Equivalent to 136,575 USD) upon committee acceptance
- **Milestone 3 (Daml code improvement tool):** 843,056 CC (Equivalent to 136,575 USD) upon final release and acceptance
- **Milestone 4 (Maintenance):** 50,265 CC / month (Equivalent to 8,143 USD / month for 12 months) paid quarterly based on actual resource usage.

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
The proposal ties funding milestones to the delivery of specific, benchmarked AI tools that outperform current State-of-the-Art (SOTA) non-specialized LLMs in three key areas: Autocompletion, File Creation, and Code Improvement.

Out-of-the-box solutions based on large language models (LLMs) have proven to be inadequate for generating syntactically and functionally correct Daml code. This can be attributed to the fact that there is a limited amount of publicly available Daml code on the internet, as a result of which current LLMs have not seen enough Daml code during their training phase. Due to this fact, LLMs produce Daml code which often contains syntax errors, fails to build, or does not pass the tests with which it was presented. For example, in a benchmark we developed that tests whether model-generated Daml code can pass test suites in real applications, GPT-5 made 33% test suites pass (or a failure rate of 67%). 50% of these failures were due to syntax errors, 44% were due to build errors, with 6% due to logic errors caught by the tests.

---

## Rationale
To deliver a highly accurate Daml coding assistant, we made the following design decisions.

**IDE extension**: 
We chose to deliver these agents primarily as IDE extensions (e.g., VS Code) rather than standalone web chat interfaces to integrate directly into the developer's existing workflow. Context-aware autocompletion and on-the-fly bug detection/resource analysis require real-time access to the local codebase, which a web interface cannot seamlessly provide. This design decision minimizes developer friction and maximizes daily active usage.

**Fine-tuning instead of RAG & Prompt Engineering on Proprietary APIs**
We looked into simply utilizing state-of-the-art proprietary models (like OpenAI's GPT-4 or Anthropic's Claude) combined with Retrieval-Augmented Generation (RAG) over Daml documentation, and advanced prompt engineering. However, our initial benchmarks demonstrated that this approach is insufficient. Because Daml is heavily underrepresented in their base training data, these off-the-shelf models suffer from fundamental syntax hallucinations and struggle with Daml's unique functional paradigms.

Therefore, we believe fine-tuning Daml-specialized tools will be more effective.

---

## Appendix A: Detailed Budget & Technical Assumptions

This appendix outlines the specific technical and labor assumptions used to calculate the funding requests for the Daml Agent project. Costs are divided into **Infrastructure** (Compute/Storage) and **Personnel** (Development/Maintenance).

### **A.1 Infrastructure Cost Assumptions**

Infrastructure estimates are derived from standard **GCP** (Google Cloud Platform) pricing. Costs are categorized into **Development** (Training/Fine-tuning) and **Production** (Hosting/Inference).

#### **1\. Development Infrastructure (Fixed Costs)**

These costs cover the GPU compute required to fine-tune the models for each milestone.

* **M1 (Autocompletion):** Involves running experiments on a g2-standard-8 (L4 GPU) instance during 5 weeks.  
* **M2 & M3 (Agentic Tools):** Requires running experiments on a powerful a2-highgpu-1g (A100 GPU) during 4 weeks per milestone.

| Cost Component | M1: Autocompletion | M2: File Creation | M3: Code Improvement |
| :---- | :---- | :---- | :---- |
| **Duration (GPU Usage)** | 5 Weeks | 4 Weeks | 4 Weeks |
| **Compute Cost (VM)** | 106.25 USD | 367.00 USD | 367.00 USD |
| **Storage Costs** | 17.31 USD | 13.85 USD | 13.85 USD |
| **API Costs\*** | 100.00 USD | 150.00 USD | 150.00 USD |
| **Total Dev Infra Cost** | **223.56 USD** | **530.85 USD** | **530.85 USD** |

*\*Note: API costs cover benchmarking calls to SOTA off-the-shelf models (e.g., Gemini, Claude, GPT) to validate performance improvements.*

#### **2\. Production Hosting (Recurring Variable Costs)**

Hosting costs are requested on a quarterly basis as they are ongoing operational expenses.

* **M1 (Autocompletion):** Uses a smaller \~3B parameter LLM, sufficient for syntax completion.  
* **M2/M3 (Agentic Tools):** Expected to require bigger specialized models (e.g., \~7B parameters) to outperform off-the-shelf solutions, resulting in higher resource usage.

| Metric | M1 (Autocompletion) | M2 & M3 (Agentic Tools) |
| :---- | :---- | :---- |
| **Model Size (Est.)** | \~3B Parameters | \~7B Parameters |
| **Active Users (Est.)** | 200 daily active users | 200 daily active users |
| **Throughput Req.** | 667 tokens/sec | 3,333 tokens/sec |
| **Monthly Est.** | **\~620.50 USD** | **\~2,921.24 USD** |

---

### **A.2 Personnel & Labor Assumptions**

Labor costs are calculated based on a standard team composition required to deliver enterprise-grade AI tools, including backend integration and DevOps.

#### **1\. Team Composition**

* **AI Engineer (1 FTE):** Dedicated for the full duration of the project (Training, Benchmarking, Adaptation).  
* **Backend Developers (2 FTE):** Engaged during "Product Packaging" phases to integrate the model into IDE plugins and APIs.  
* **DevOps Engineer (1 FTE):** Engaged for deployment and infrastructure setup.

#### **2\. Milestone Breakdown**

The project timeline includes buffers for contingency and user validation to ensure high-quality deliverables.

* **M1: Autocompletion (16 Weeks)**  
  * **Focus:** Core syntax learning and IDE plugin development.  
  * **Breakdown:** 5 weeks Model Adaptation \+ 4 weeks Backend \+ 1 week Deployment \+ 2 weeks Validation \+ 4 weeks Contingency.  
  * **Total Labor:** 123,450 USD  
* **M2: File Creation (14 Weeks)**  
  * **Focus:** Generating full Daml files from natural language prompts.  
  * **Breakdown:** 4 weeks Model Benchmarking/Adaptation \+ 8 weeks Development \+ 2 weeks Contingency.  
  * **Total Labor:** 136,575 USD  
* **M3: Code Improvement (14 Weeks)**  
  * **Focus:** Bug detection and resource-optimization review capabilities.  
  * **Breakdown:** 4 weeks Model Benchmarking \+ 8 weeks Development \+ 2 weeks Contingency.  
  * **Total Labor:** 136,575 USD  
* **M4: Maintenance (Ongoing)**  
  * **Focus:** Server uptime, minor bug fixes, and user support.  
  * **Resource:** \~2 man-days per month.  
  * **Cost:** 1,680 USD/month (20,160 USD/year).
