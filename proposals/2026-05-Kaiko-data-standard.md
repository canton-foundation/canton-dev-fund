# Kaiko Data Standard

## Abstract

Financial applications on Canton need reliable, real-time data: asset prices, reference rates, market indicators, and more. Today, every application that wants to consume this data has to build a custom integration with each data provider it uses. If it wants to switch providers, or add a second one, it has to rebuild that integration from scratch. This creates unnecessary complexity, slows down development, and locks applications into specific vendors.

The Kaiko Data Standard fixes this by establishing a shared way for data providers to publish data on Canton and for applications to read it. Think of it like a common plug standard: once it exists, any device works with any socket. Any oracle provider that implements the Standard can be consumed by any Canton application without additional integration work, and any application built on the Standard can switch providers or add new ones without changing its code.

This is not a theoretical proposal. Kaiko has already built and deployed this Standard in its production oracle, and it is actively being used by institutional clients today. It was developed in close collaboration with Digital Asset and has drawn adoption interest from DRW and Cumberland. The grant would fund the formal publication of the Standard into [Splice](https://github.com/hyperledger-labs/splice) (the Canton open-source repository), making it a true ecosystem-wide common good, along with the ongoing support and maintenance needed to keep it useful over time.

For the Canton ecosystem, this means faster application development, more competition among data providers, and a stronger, more interconnected network overall.

## Specification

### 1\. Objective

**Problem:** Today, consuming on-ledger data creates tight coupling between application providers (consumers) and specific oracle implementations (producers). This coupling generates:

* **Vendor lock-in:** switching oracle providers or delivery modes requires DAML rewrites  
* **High adoption friction:** every new integration is a bespoke project  
* **Slower innovation:** application teams hesitate to adopt new oracle delivery models due to interface breakage risk  
* **Fragmented observability:** normalizing on-ledger metrics and telemetry across providers is difficult

Every one of these problems slows down Canton adoption. New application teams spend time on integration plumbing rather than building their product. Existing applications are reluctant to add data feeds or switch providers because the cost is too high. The ecosystem as a whole remains more fragmented than it needs to be.

**Intended outcome:** A formally specified and publicly available DAML interface, published in Splice, that any oracle provider can implement and any Canton application can consume. Application providers integrate once to the Data Standard and can thereafter switch oracle providers or delivery modes without changing their DAML application logic. The result is a more open, competitive, and composable data layer for the entire Canton network.

### 2\. What Already Exists vs. What Is Net-New

**What already exists in Splice and adjacent efforts**

Splice already defines a pattern for shared DAML interfaces. Existing examples include `splice-api-featured-app-v1`, which introduces the `FeaturedAppRight` and `FeaturedAppActivityMarker` interfaces. These establish that Splice supports modular, multi-implementer interface packages and that Canton applications can be built against stable, governance-neutral contracts. This architectural model is not new.

There is no existing data layer standard in Splice. No DAML interface package currently defines how on-ledger data points (prices, reference rates, market indicators, or any structured financial data) should be published, versioned, or consumed in a provider-agnostic way. Each oracle integration on Canton today is bespoke and bilateral.

**What the Kaiko Data Standard introduces**

* A dedicated DAML interface package for the data layer, specifically covering on-ledger data point publication and consumption. This does not exist in Splice today.  
* A reference implementation with a validated producer (oracle) and consumer (application) example, grounded in a live production deployment, not a prototype.  
* Developer documentation specifically for oracle producers and application consumers in the context of the data layer.

The Kaiko Data Standard deliberately mirrors the architectural pattern already established in Splice rather than inventing a new one. The contribution is a new application of a proven model to a domain (data) that is currently unaddressed.

### 3\. Implementation Mechanics

The Kaiko Data Standard is implemented as a set of DAML interfaces, following the same architectural pattern already established in Splice (e.g., `splice-api-featured-app-v1`). It defines:

* A stable **data contract interface** for published data points on Canton  
* A **versioned data model** that producers can extend and version independently (e.g., `DataPointV1`, `DataPointV2`), without breaking downstream consumers  
* The **Standard itself** follows a named versioning scheme (`v1`, `v2`, etc.) to allow it to evolve over time without breaking existing implementations

Two complementary interfaces are within the scope of this Data Standard:

- **DataPoint**: A general interface that can be used for arbitrary data models. It supports all common DAML types including primitives, containers, and nested structures. Perfect for complex data points but is more complex to implement than fixed types. This flexibility is often required for institutional use-cases where not just price matters.  
- **Quote**: A specialized interface for quote price, one of the most common data structures required by most DeFi applications. This interface can be used to simplify implementation when it is known that only the price and timestamp are required.

Both interfaces are used as follow:

1. The Data Provider or Oracle creates a Daml template that implements the relevant interface from the Data Standard.  
2. The Data Consumer creates a Daml template for their application and uses the Data Standard in place of the Oracle data point. The Data Consumer can implement the logic to fetch the price from any Daml template that implements the relevant interface from the Data Standard.  
3. The Data Consumer gets access to a data point contract published by the oracle through any data delivery mechanism (push, pull, request-response, or any other), and uses the data point contract into their application workflow.  
4. The Data Consumer is free to change Data Provider and don’t need to update the Daml template of their application.

Example:

```
-- | Data Standard / Quote v1
--
-- Minimal, strictly-typed interface for publishing price quotes.
--
-- An implementation must define:
--   - `view`       . returns `PublishedQuoteView`. Reachable from Daml code
--                    via `view cid` AND exposed off-ledger through the
--                    Ledger API's interface filters.
--   - `fetchValue` . returns the strict `Quote` payload. Callable only from
--                    Daml code; a convenience accessor so on-ledger
--                    consumers can grab the payload without unpacking the
--                    full view.
--
module DataStandard.QuoteV1 where

-- | The strict payload returned by a `PublishedQuote` instance.
--
-- The real-world price is reconstructed as `price / 10 ^ decimals`. For
-- example, BTC/USD at 45000.00 with `decimals = 8` is encoded as
-- `price = 4500000000000`.
data Quote = Quote
  with
    feedId : Text
      -- ^ Stable identifier for the price feed (e.g. "BTC/USD", "ETH/EUR").
    price : Int
      -- ^ Integer-encoded price. `Int` is 64-bit signed.
    decimals : Int
      -- ^ Number of decimal places applied to `price`.
    timestamp : Time
      -- ^ Time at which the producer observed this quote.
  deriving (Eq, Show)

-- | Off-ledger view of a `PublishedQuote`. Carries publisher identity,
-- publication metadata, and the strict `Quote` so subscribers can read
-- everything in a single ACS query through the Ledger API.
--
-- Note: `publishedAt` records when the contract was created on-ledger,
-- which may differ from `quote.timestamp` (the quote time).
data PublishedQuoteView = PublishedQuoteView
  with
    distributor : Party
      -- ^ The party publishing this quote on-ledger (signatory of the
      -- implementing template).
    publishedAt : Time
      -- ^ Ledger time at which the quote was published on-chain.
    quote : Quote
      -- ^ The strict, typed quote payload.
  deriving (Eq, Show)

-- | The standard interface that any quote producer must implement.
--
-- Consumers depend on this module only; they never need to know which
-- concrete template produced the quote.
interface PublishedQuote where
  viewtype PublishedQuoteView

  fetchValue : Quote
    -- ^ Return the strict `Quote` payload. MUST equal `(view this).quote`.
```

**Implementation workflow:**

1. Finalize and formally specify the DAML interface definition  
2. CIP approval confirming community alignment on the Data Standard’s content  
3. Implement and test the code against real oracle data pipelines (leveraging Kaiko's existing production deployment as a reference)  
4. Conduct alignment sessions with data consumers to validate the design and gather implementation feedback  
5. Submit the DAML package to the Splice repository via Pull Request, pending Digital Asset's review and approval  
6. Publish reference documentation (developer guide for producers and consumers) on Kaiko's website and coordinate with the Canton ecosystem

**Technologies:** DAML, Canton ledger, Splice (Hyperledger Labs), Kaiko's existing oracle infrastructure.

**Operational approach:** Post-publication, the Standard is governed by Splice's open-source contribution process. Any party, whether oracle providers, application developers, or ecosystem participants, may propose changes, improvements, or new versions via GitHub Pull Requests. Kaiko does not retain unilateral control over the Standard post-merge. Kaiko commits to providing ongoing support, maintenance, and regular office hours to assist adopters, answer technical questions, and facilitate future contributions. This is a sustained commitment that requires dedicated resources beyond the initial build.

### 4\. Long-Term Ownership and Maintenance Post-Merge

Once merged into Splice, the Standard is governed entirely by Splice's open-source contribution process under Hyperledger Labs. Kaiko does not retain unilateral control over the Standard, its roadmap, or its versioning decisions. Any party, whether oracle providers, application developers, or other ecosystem participants, may propose changes, new versions, or improvements via standard GitHub Pull Requests, subject to community review.

Kaiko does not step back after the merge. Kaiko commits to the following ongoing responsibilities, funded in part by this grant:

* **Ongoing maintenance:** Kaiko will respond to issues filed against the Standard on GitHub, submit bugfixes and clarifications, and maintain compatibility of its own production oracle with the published Standard.  
* **Community Q\&A and issue resolution:** Kaiko will monitor and respond to community questions in relevant channels (e.g., Discord, GitHub Discussions, gsf-outreach) with a target response time of 5 business days.

**Distinction from Kaiko's commercial product:** The Standard is deliberately decoupled from Kaiko's proprietary oracle product. Kaiko's commercial oracle implements the Standard, but the Standard itself does not depend on or require Kaiko's oracle. Any provider can implement it independently.

### 5\. Architectural Alignment

The Kaiko Data Standard is a natural extension of Canton's interface-based composability model. Splice already establishes the pattern of defining DAML interfaces that multiple parties implement independently (e.g., `FeaturedAppRight`, `FeaturedAppActivityMarker`). The Data Standard applies this exact model to the data layer:

* **Protocol-level standardization:** defines a shared language for on-ledger data points, reducing fragmentation across oracle implementations  
* **Composability:** multiple applications can consume and re-use the same published data contracts, enabling shared infrastructure such as indexers, dashboards, and analytics tools  
* **Openness:** by living in Splice (Hyperledger Labs), the Standard inherits community governance and is not controlled by any single vendor  
* **Ecosystem resilience:** application providers can add secondary data sources or switch providers without rewrites, improving the long-term resilience of Canton-based applications  
* **Alignment with ecosystem goals:** the Standard directly advances Canton's stated priorities of adoption, composability, and openness

The ecosystem-level impact is concrete. A standardized data layer means:

* New applications can go live faster because the data integration layer is already solved  
* More oracle providers can enter the Canton ecosystem without needing bilateral agreements with every application  
* The Canton network becomes more attractive to institutional participants who expect open, interoperable infrastructure as a baseline

Beyond oracle data, the Standard also provides a foundation for normalizing application observability. Application providers can publish standardized metrics and events using the same interface, enabling shared dashboards and ecosystem-wide transparency.

## Milestones and Deliverables

### Milestone 1: Design, Community Alignment & CIP

* **Estimated Delivery:** 8 weeks from grant approval  
* **Funding:** 900,000 CC upon committee acceptance  
* **Focus:** Finalize the DAML interface specification, align with Cumberland, Digital Asset and data consumers, and drive a CIP from drafting to submission and approval.

**Deliverables / Value Metrics:**

* Finalized DAML interface specification, including versioning strategy (data model versioning and Standard versioning)  
* Documented alignment sessions with Cumberland, Digital Asset and at least 2 oracle providers.  
* Reference implementation: at least one producer (oracle) and one consumer (application) example, validated against Kaiko's live oracle deployment (Broadridge, Bitsafe, NCFX)  
* CIP submitted and approved

**Ecosystem value:** The CIP approval date and the number of external parties who have reviewed and provided documented feedback on the specification prior to submission. A Standard that reflects multi-party input at draft stage is significantly more likely to be adopted broadly.

### Milestone 2: Merge Request Approved & Data Standard Deployed

* **Estimated Delivery:** 4 weeks from CIP approval (Milestone 1 completion)  
* **Funding:** 400,000 CC upon committee acceptance  
* **Focus:** Implement and test the DAML package, incorporate review feedback from Digital Asset and the Splice community, reach merge approval, and deploy the Standard in Splice, making it universally accessible to all Canton participants

**Deliverables / Value Metrics:**

* Complete DAML package implementation with a passing test suite covering producer and consumer interface conformance  
* All review comments addressed; PR approved by Digital Asset to publish Data Standard in splice.  
* DAML package successfully merged into Splice and available to all Canton participants  
* Developer documentation published on Kaiko's website (integration guide for oracle producers and application consumers)

**Ecosystem value:** Public documentation and open-source codebase published in splice codebase.

### Milestone 3: Ecosystem Outreach, Use Case Showcase & Adoption Incentive

* **Estimated Delivery:** Up to 12 months from Milestone 2 completion  
* **Funding:** 100,000 CC per client that adopts and goes live on the Data Standard, up to a maximum of 10 clients (1,000,000 CC maximum)  
* **Focus:** Drive ecosystem-wide awareness and reward demonstrated real-world adoption of the Standard by Canton application providers

**Deliverables / Value Metrics:**

* Public outreach campaign published on LinkedIn and via gsf-outreach channels, highlighting the Standard's availability and value  
* Optional collaboration with the Canton Marketing Committee on announcement coordination and amplification  
* Published use case showcase featuring at least 1 live user of the Data Standard (from existing users: Broadridge, Bitsafe, NCFX, or new adopters), illustrating a concrete integration and the interoperability benefits achieved  
* Per-client payment: 100,000 CC released upon committee acceptance that a client has successfully integrated and gone live on the Data Standard, up to 10 clients

**Ecosystem value:** Number of independent Canton applications consuming live data via the Standard. This directly measures whether the Standard has reduced integration friction at scale, not just whether it was published.

**Rationale for the per-client adoption incentive structure:** By publishing the Data Standard as a common good and making it freely available through Splice, Kaiko is deliberately reducing its own commercial stickiness. The Standard enables Kaiko's existing clients to more easily switch to an alternative data provider, as it removes proprietary API lock-in as a retention mechanism. This is a concrete commercial sacrifice made in the interest of ecosystem health. The per-client adoption payment compensates Kaiko for this accepted increase in churn risk, and aligns the Foundation's incentive with the Standard's actual adoption. The more ecosystem participants adopt it, the greater the common good delivered, and the greater the compensation.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone  
* Demonstrated functionality or operational readiness  
* Documentation and knowledge transfer provided  
* Alignment with stated value metrics

**Project-specific acceptance conditions:**

* **Milestone 1:** CIP for Data Standard approved; reference implementation available  
* **Milestone 2:** Data Standard merged in Splice and accessible to all Canton participants; developer documentation publicly live on Kaiko's website  
* **Milestone 3:** Outreach content published on LinkedIn and gsf-outreach; use case showcase publicly available featuring at least 1 named adopter; per-client payments released upon verified go-live confirmation for each qualifying adopter, up to 10

## Funding

**Total Funding Request:** 1,300,000 CC for Milestones 1 and 2, plus a variable amount for Milestone 3 dependent on adoption of the Standard.

**Payment Breakdown by Milestone**

| Milestone | Description | Amount |
| :---- | :---- | :---- |
| **Milestone 1** | Design, Community Alignment & CIP | 900,000 CC |
| **Milestone 2** | Merge Approved & Deployed in Splice | 400,000 CC |
| **Milestone 3** | Per client adopted on the Data Standard (max 10 clients) | 100,000 CC per client |

## Use of Funds

The grant covers the following categories of expenditure, each representing a real resource commitment that would not otherwise be funded:

* **Engineering time:** Design, implementation, and testing of the DAML package requires dedicated senior engineering capacity with expertise in DAML, Canton's data model, and financial data pipelines. This work is distinct from Kaiko's commercial product development and is being undertaken as a deliberate ecosystem contribution.  
* **CIP coordination:** CIP coordination: Driving a CIP to approval requires sustained engagement across the Canton community, oracle providers, and application developers, spanning structured review sessions, multiple feedback and revision cycles, and thorough documentation. While a valuable process, it is a lengthy one that carries meaningful opportunity cost relative to commercial priorities.  
* **Splice contribution process:** Navigating an open-source review cycle (PR preparation, addressing reviewer feedback, iterating on implementation) requires dedicated engineering bandwidth beyond the initial build phase.  
* **Documentation:** Producing high-quality developer documentation for both oracle producers and application consumers is a non-trivial effort that benefits the ecosystem broadly but generates no direct commercial return for Kaiko.  
* **Ongoing support, maintenance and office hours:** Kaiko commits to providing post-launch support for adopters, including structured office hours, community Q\&A, and issue resolution. As adoption grows, this becomes a sustained and open-ended resource commitment. The grant helps offset the cost of this long-term stewardship role.  
* **Outreach and ecosystem promotion:** Producing high-quality content (blog posts, use case showcases, LinkedIn campaigns) and coordinating with the Canton Marketing Committee requires dedicated time from both technical and marketing functions.  
* **Commercial opportunity cost and churn risk (Milestone 3):** By publishing the Standard as a common good, Kaiko removes proprietary API lock-in as a client retention mechanism, deliberately accepting an increased risk of client churn. The per-client adoption incentive directly compensates for this sacrifice, while aligning payment with actual ecosystem adoption outcomes.

## Co-Marketing

Upon release, Kaiko will collaborate with the Canton Foundation on:

* **Announcement coordination:** joint announcement of the Standard's availability in Splice across both Kaiko's and the Foundation's communication channels  
* **Technical blog and case study:** co-authored content explaining the Standard, its ecosystem value, and adoption pathway, including real-world usage examples from Kaiko's existing client base  
* **Developer and ecosystem promotion:** promotion through Kaiko's developer channels, website documentation, LinkedIn, and gsf-outreach  
* **Canton marketing team alignment:** active coordination with the Canton Marketing Committee to amplify the announcement and drive oracle provider and application developer adoption  
* **Use case showcase:** public case study with at least one named adopter, demonstrating the interoperability benefits of the Standard in a live production environment

## Motivation

Every financial application on Canton needs data. Today, getting that data onto the ledger is harder than it should be. Each application has to build its own bespoke integration with each data provider it uses, and those integrations are fragile: they break when providers change their APIs, they have to be rebuilt when switching vendors, and they cannot be reused across projects. The result is slower development, higher costs, and a Canton ecosystem that is more siloed than it needs to be.

A shared data standard changes this dynamic entirely. When all oracle providers speak the same language, the marginal cost of adding a new data source drops to near zero. Application teams focus on their product rather than plumbing. New oracle providers can enter the ecosystem and immediately be usable by every existing application. Competition shifts from who has the most proprietary lock-in to who provides the best data and service.

This is what the Kaiko Data Standard delivers. It is already running in production, serving clients including Broadridge, Bitsafe, and NCFX. It was built in close collaboration with Digital Asset, and DRW and Cumberland have expressed interest in adopting it. The infrastructure is proven; this grant is about formalizing it as open, shared Canton ecosystem infrastructure and ensuring it is properly supported, documented, and promoted for the long term.

The broader impact on Canton is significant. A standardized data layer makes the network more attractive to new participants, reduces the time and cost of building on Canton, and demonstrates the kind of open, collaborative infrastructure development that institutional participants expect from a serious financial network.

## Rationale

### Why this approach?

The interface-based model is the right design for Canton's architecture. Splice already uses this pattern (e.g., `FeaturedAppRight`) to define shared capabilities that multiple parties implement independently. The Kaiko Data Standard extends this model to the data layer, ensuring it integrates naturally with how Canton applications are built and maintained.

### Why Splice?

Publishing in Splice (Hyperledger Labs) means the Standard is immediately available to all Canton participants without any additional distribution steps. It is governed by a neutral, open-source process where no single vendor controls the roadmap. It is subject to community review, which improves quality and builds confidence in adoption across the ecosystem.

### Why Kaiko?

Kaiko brings a combination of capabilities that makes it the right team to deliver this:

* **Domain expertise:** as an established oracle and financial data provider, Kaiko has deep knowledge of how data is produced, delivered, consumed, and treated across financial applications  
* **Production validation:** the Standard has already been tested in a live production environment with institutional clients, which significantly reduces implementation risk  
* **Institutional relationships:** development was carried out in close collaboration with Digital Asset, and early adoption interest has been confirmed by DRW and Cumberland  
* **Neutral stewardship commitment:** by contributing the Standard to Splice and subjecting it to open-source governance, Kaiko ensures it cannot be appropriated for competitive advantage. It belongs to the ecosystem. Kaiko further commits to ongoing support, office hours, and maintenance to ensure the Standard remains useful, well-documented, and responsive to community feedback over time.

**Alternatives considered:** Kaiko could have published a proprietary oracle API standard. That would have delivered short-term commercial benefit but would not have solved the ecosystem's fragmentation problem and would not have qualified as a common good. The open-source, Splice-based approach was chosen specifically to maximize ecosystem value. This grant is a partial offset for the commercial trade-off that decision entails.  
