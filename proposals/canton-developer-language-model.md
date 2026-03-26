## Development Fund Proposal

**Author:kasoqian** 
**Status:** Draft
**Created:** 2026-02-28

---

## Abstract

This proposal aims to build a Canton-specific Large Language Model trained on a dedicated Canton technical knowledge corpus to provide reliable technical assistance for Canton developers.

Canton provides powerful infrastructure for distributed financial applications, but the developer experience remains challenging. The documentation is extensive, the architecture is sophisticated, and the platform evolves quickly. As a result, developers often rely on community discussions and official support responses to solve practical problems, particularly around node deployment, Ledger API usage, and DAML contract syntax.

Over time, the Canton community channels have accumulated a large amount of high-quality technical discussions, especially the detailed and professional responses from official contributors. In practice, this has formed a valuable body of technical knowledge. However, most of this knowledge exists in historical conversations and is difficult to access, search, or reuse efficiently.

Developers frequently spend significant time searching for past discussions or asking similar questions repeatedly. This slows down onboarding and increases the support burden on core contributors.

This project proposes a structured approach to transforming existing Canton technical knowledge into a reusable knowledge infrastructure.

The first step is to systematically organize historical technical materials, including:

* Official Canton documentation
* Technical guides and reference materials
* Curated official technical support responses
* Complete discussion threads around common development issues

This process will enable:

* Extraction of structured technical FAQs
* Identification of key technical practices and patterns
* Consolidation of common problem-solving workflows
* Identification of gaps and improvement opportunities in the documentation

Based on this structured Canton knowledge corpus, the project will build a dedicated domain-specific Large Language Model optimized for Canton development.

The resulting system will function as a technical AI assistant that allows Canton developers to obtain guidance through natural language queries. Instead of searching across multiple sources, developers will be able to directly obtain relevant technical guidance.

The long-term goal is to establish a sustainable technical knowledge infrastructure for the Canton ecosystem and improve the efficiency and scalability of developer support.

---

## Specification

### 1. Objective

The objective of this project is to build a Canton-specific technical language model that enables developers to quickly obtain reliable technical guidance through natural language queries.

The model will support questions related to:

* Node deployment
* Ledger API usage
* DAML contract syntax
* Common development questions

The project will result in a continuously maintainable Canton technical corpus and model service.

---

### 2. Implementation Mechanics

The project will be implemented in three stages.

**Stage 1 — Corpus Construction**

Canton technical materials will be collected and structured, including:

* Official documentation
* Example code
* Official technical support responses
* High-quality community technical discussions

All materials will be cleaned and structured into a maintainable Canton technical corpus.

The corpus will support continuous updates.

---

**Stage 2 — Model Development**

A Canton-specific technical model will be built using the corpus.

The model will be based on mature open-source models with domain adaptation and technical Q&A optimization.

The primary goal is to improve accuracy for Canton technical questions rather than general-purpose capabilities.

---

**Stage 3 — Service Deployment**

The model will be delivered as a developer tool:

* Web interface
* API access
* Documentation

Developers will be able to query Canton technical questions using natural language.

The service will support continuous updates.

---

### 3. Architectural Alignment

This project does not modify the Canton protocol or node implementations.

The project operates entirely at the developer tooling layer.

The project will:

* Improve developer experience
* Reduce onboarding friction
* Increase development efficiency
* Reduce repetitive support workload

This project represents shared infrastructure that benefits the entire Canton ecosystem.

---

### 4. Backward Compatibility

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1 — Canton Corpus Construction

**Estimated Delivery:** 2 weeks

**Focus**

Build the Canton technical corpus.

**Deliverables**

* Official documentation organized
* Official support Q&A organized
* Structured corpus created
* Update workflow defined

---

### Milestone 2 — Model Development

**Estimated Delivery:** 3 weeks

**Focus**

Develop the Canton-specific technical model.

**Deliverables**

* Model training completed
* Internal testing version available
* Demonstrated Canton technical Q&A capability

---

### Milestone 3 — Service Release

**Estimated Delivery:** 2 weeks

**Focus**

Release developer-accessible service.

**Deliverables**

* Web service deployed
* API available
* Documentation completed
* Real developer queries supported

---

## Acceptance Criteria

Completion will be evaluated based on:

* Milestones delivered as specified
* Demonstrated Canton technical question answering capability
* Stable service availability
* Complete documentation
* Maintainable corpus

---

## Funding

**Total Funding Request:** 2,625,000 CC

---

### Payment Breakdown

Milestone 1 — 656,000 CC

Includes:

1. **Canton technical corpus construction**
   Systematic collection of official documentation, example code, and technical support content to build a high-quality technical knowledge base.

2. **Data cleaning and normalization pipeline**
   Implementation of structured processing workflows to remove redundancy and standardize technical content.

3. **Technical knowledge structure design**
   Design of data structures and knowledge organization optimized for AI model training.

4. **Automated corpus update workflow**
   Establishment of a sustainable pipeline for corpus updates and version management.

5. **Corpus quality evaluation framework**
   Definition of validation standards to ensure accuracy and consistency of training data.

---

Milestone 2 — 1,313,000 CC

Includes:

1. **Canton-specific model adaptation**
   Domain adaptation of mature open-source models with optimization for Canton technical tasks.

2. **Technical Q&A fine-tuning**
   Supervised fine-tuning using Canton technical corpora to improve domain-specific accuracy.

3. **RAG system development**
   Implementation of a high-accuracy retrieval-augmented generation system for reliable technical responses.

4. **Model evaluation and optimization**
   Development of benchmark datasets and continuous improvement of accuracy and stability.

5. **Model training and GPU resources**
   Coverage of compute costs for training, experimentation, and inference optimization.

---

Milestone 3 — 656,000 CC

Includes:

1. **Developer API service implementation**
   Development of stable and scalable model access interfaces.

2. **Web-based developer interface**
   Implementation of an interactive technical Q&A interface for developers.

3. **Production-grade deployment architecture**
   Deployment of a reliable and scalable online model service.

4. **Developer documentation and examples**
   Preparation of complete API documentation and usage examples.

5. **Maintenance and continuous update framework**
   Establishment of workflows for ongoing model and corpus updates.

---

### Volatility Stipulation

The project is expected to be completed within 3 months.

If the project extends beyond 3 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for CC price volatility.


## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on ecosystem communication and developer outreach.

Planned activities include:

* Coordinated announcement with the Canton Foundation upon initial release
* A technical blog post describing the Canton technical corpus and Large Language Model architecture
* A developer-oriented introduction demonstrating practical usage scenarios such as Ledger API usage and DAML development support
* Presentation or demonstration sessions for the Canton developer community where appropriate

The project will also provide **open APIs that allow the Canton Large Language Model to be integrated into developer communication channels**, including Slack and Telegram. This will enable developers to access Canton technical assistance directly within existing community environments.

The project team will maintain public documentation describing:

* The Canton technical corpus structure
* Model capabilities and limitations
* API usage and integration guidelines
* Integration examples for Slack and Telegram

These activities aim to ensure that the Canton-specific Large Language Model becomes a widely accessible and practical developer resource for the ecosystem.

---

## Motivation

The primary bottleneck to its ecosystem growth is currently the high cost of knowledge acquisition. The strategic value of this project is built upon three core pillars:

- Accelerating Developer "Time-to-Value":

Developing on Canton involves mastering DAML syntax, complex cross-domain orchestration, and secure node configurations. Currently, new developers often spend weeks sifting through fragmented documentation or waiting for community forum replies. By providing a 24/7, sub-second response AI Technical Assistant, we can compress the resolution time for common issues from "hours" to "seconds," significantly increasing developer retention and the speed of application deployment.

- Scaling Support Sustainability for Core Contributors:

At present, the Canton core team handles a high volume of repetitive technical support tasks. As the ecosystem scales, this manual support model becomes unsustainable. Implementing this project will automate the resolution of over 70% of baseline technical queries, allowing the core team to focus their energy on protocol-level innovation rather than repeatedly explaining configuration parameters.

- Building a "Living" Knowledge Infrastructure for Canton:

Static documentation often lags behind rapid code updates. This project transforms fragmented, informal knowledge—such as historical Slack discussions, GitHub Issues, and the latest Release Notes—into a structured, searchable, and evolving "active asset." This is not just a tool improvement; it is the establishment of a self-updating technical knowledge graph for the entire Canton ecosystem.

---

## Rationale

As a builder on Canton, I frequently encounter specific technical challenges during development. Unfortunately, general-purpose AI models like OpenAI or Gemini often fail to provide accurate guidance for such a specialized domain. For instance, when I query Ledger API usage, they often return outdated v1 instructions rather than the latest version. The data lag in these third-party platforms, which fail to capture Canton’s rapid proposal updates, creates significant friction in the development workflow.

Consequently, I often rely on the official Slack channels for support. I’ve noticed that the responses from the official team are consistently thorough and professional—they represent a significant investment of expertise and are, in fact, an invaluable repository of technical knowledge.

If we can leverage these high-quality community interactions alongside official documentation to train a dedicated Canton LLM, it would provide developers with reliable, up-to-date assistance. I believe this would be a highly effective and strategic addition to the Canton developer ecosystem.

