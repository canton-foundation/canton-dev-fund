## Development Fund Proposal

**Author:kasoqian** 
**Status:** Draft
**Created:** 2026-02-28

---

## Abstract

This proposal aims to build a Canton-specific language model trained on a dedicated Canton knowledge corpus to provide reliable technical assistance for Canton developers.

Currently, developers rely primarily on official documentation and support responses from official team members in community channels. While these resources are high quality, they are fragmented and often difficult to navigate. Developers frequently spend significant time searching for answers or asking similar questions, particularly around node deployment, Ledger API usage, and DAML contract syntax.

Community channels contain a large volume of high-quality technical responses from official contributors. These responses represent valuable technical knowledge but are not systematically organized or reusable.

This project will organize official documentation and official technical support responses into a structured Canton knowledge corpus and use it to build a dedicated technical language model.

The resulting system will serve as a developer tool, allowing Canton builders to obtain technical guidance through natural language queries.

The goal is to establish a sustainable technical knowledge infrastructure for the Canton ecosystem.

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

**Estimated Delivery:** 4 weeks

**Focus**

Build the Canton technical corpus.

**Deliverables**

* Official documentation organized
* Official support Q&A organized
* Structured corpus created
* Update workflow defined

---

### Milestone 2 — Model Development

**Estimated Delivery:** 6 weeks

**Focus**

Develop the Canton-specific technical model.

**Deliverables**

* Model training completed
* Internal testing version available
* Demonstrated Canton technical Q&A capability

---

### Milestone 3 — Service Release

**Estimated Delivery:** 4 weeks

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

The project is expected to be completed within 6 months.

If the project extends beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for CC price volatility.
