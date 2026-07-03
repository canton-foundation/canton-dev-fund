## Development Fund Proposal

**Author:** Crystal Yang & Ria Saheta, Beet Labs
**Status:** Draft
**Created:** 2026-07-03
**Label:** daml-tooling
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Need Champion

---

## Abstract
 
Beet Labs proposes the Canton Edge-Data SDK: open-source developer tooling that lets Canton and Daml developers pull authenticated physical-world sensor data into multi-party workflows, with sub-transaction privacy enforced at the protocol level.
 
Today's Canton ecosystem is strongest in institutional workflows, capital markets, DeFi, and regulated multi-party coordination. The SDK extends that strength into a new data source: physical-world edge devices. Hardware and IoT sensors generate data that is often sensitive, commercially valuable, or subject to regulatory access controls, exactly the category of information Canton's Daml authorization model and sub-transaction privacy were designed to handle.
 
The core value here is not hardware. It's a reusable Canton-native infrastructure layer: Daml templates for device registration, data submission, verification, and access control, a Ledger API v2 backend integration, and reference hardware adapters. This removes the need for each Canton developer team to build custom device-to-ledger infrastructure from scratch.
 
Beet, our ETHDenver 2026 first-place Canton track winner, is the reference implementation proving this architecture works end to end. This proposal generalizes that validated proof of concept into reusable public-good tooling for the Canton developer community.
 
---
 
## Specification
 
### 1. Objective
 
Canton developers building in capital markets, supply chain, pharmaceutical, and other regulated industries increasingly need to incorporate physical-world data into their Daml workflows. A bond settlement workflow may need verified custody sensor readings. A pharmaceutical distribution workflow may need authenticated cold-chain temperature data. A trade finance workflow may need verified physical-asset condition reports. Today, no reusable Canton-native tooling exists to connect edge devices to these workflows; each team builds custom device-to-ledger infrastructure independently, with no established patterns for Daml authorization, privacy, or event streaming in hardware contexts.
 
The Canton Edge-Data SDK eliminates this repeated work. Upon completion, a Canton developer can use the SDK to submit authenticated, hashed sensor output into their existing Daml workflow with appropriate signatory and observer access controls, without building the underlying integration layer themselves. The SDK is MIT licensed and fully open source.
 
Intended outcomes:
 
- Canton and Daml developers have reusable, well-documented tooling for integrating edge-device data into existing workflows
- Established Daml authorization patterns for hardware data contexts reduce development time and security risk for Canton teams
- The foundation exists for future regulated edge-data applications on Canton, across pharmaceutical, supply chain, capital markets, and industrial verticals
- Beet serves as a working reference application demonstrating end-to-end Canton edge-data integration
### 2. Implementation Mechanics
 
The SDK is organized into three layers:
 
**Device Layer:** on-device firmware modules for ESP32, Arduino, and Raspberry Pi that handle sensor reading, local SHA-256 hashing, payload construction, and transmission to the backend integration layer. Raw sensor data does not leave the device; Canton receives only a structured, hashed output.
 
**Backend Integration Layer:** a Ledger API v2 gRPC client that receives device payloads, constructs Canton commands, handles command deduplication, manages connection state, and subscribes to Canton event streams for real-time hardware-triggered workflow execution. Implemented in a language-agnostic manner, with reference implementations in Python and TypeScript.
 
**Daml Contract Layer:** a set of reusable Daml templates covering device registration and identity management, authenticated data submission with configurable signatory/observer patterns, verification and audit-trail contracts, access-control templates for regulated multi-party data workflows, and event-streaming patterns for real-time hardware-triggered workflow execution.
 
The three layers are designed to be independently usable. A Canton developer team with their own hardware setup can use only the Daml templates and backend integration layer. A hardware developer new to Canton can use all three layers together via the reference adapters.
 
### 3. Architectural Alignment
 
**Why Canton:** Canton's value proposition maps directly onto regulated edge-data workflows. Sub-transaction privacy lets a sensor reading carry different visibility for different parties (the operator sees raw data, the regulator sees aggregate signals, the counterparty sees a verified hash), enforced at the ledger level rather than the application layer. Daml's signatory/observer model makes these access controls part of the contract itself, not something an application-layer bug can bypass. Traditional databases require trusting the operator; public blockchains expose too much; generic permissioned chains rely on application-layer controls that can be bypassed. For hardware data touching HIPAA, FDA 21 CFR Part 11, GDPR, or commercial confidentiality requirements, Canton is the only production blockchain that meets the threshold requirement of not unnecessarily exposing raw data. Edge-data workflows also routinely span multiple organizations (sensor operator, data consumer, regulator, auditor), which is exactly what Canton's multi-party coordination model handles natively, without a trusted intermediary.
 
**Fit with the Development Fund and CIP process:** this proposal is submitted under the Development Fund established by [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) (the 5% Foundation-governed Development Fund) and governed by [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md). The closest architectural precedent in the CIP Standards Track is [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) (dApp Standard), which formalizes reusable developer-facing patterns the same way this SDK formalizes device-to-ledger patterns. There is currently no CIP governing hardware or edge-device integration specifically; this SDK operates entirely at the application/tooling layer (a client library plus Daml templates), makes no protocol-level changes, and does not conflict with any Draft or Proposed CIP (e.g. CIP-0112 Token Standard V2, CIP-0117 Logical Synchronizers). If community interest in edge-data standardization grows, this SDK is a natural input to a future Standards Track CIP, but does not require one to ship.
 
**Positioning relative to current developer demand:** the Canton Foundation's Q1 2026 Developer Experience and Tooling Survey (41 active developers, January 20 to February 4, 2026) shows the community's loudest current asks are local dev frameworks, visual debugging, and typed SDKs/language bindings, not hardware integration specifically. Edge-data is not the top-requested tool in that survey. The case for this SDK rests on where Canton's institutional base already sits (custody, trade finance, pharma-adjacent settlement; see Motivation), positioning it ahead of where that demand is heading rather than reacting to where it already is. Those survey-identified gaps are real and are better addressed by teams with that specific expertise; this proposal's differentiator is the combination of embedded systems experience and production Canton/Daml integration. No other Dev Fund proposal identified in this review targets hardware/edge-device integration specifically.
 
### 4. Backward Compatibility
 
No backward compatibility impact. The SDK is new, additive tooling, a client library and a set of Daml templates, and does not modify existing Canton protocol behavior, Ledger API interfaces, or any previously deployed contract. Adoption is opt-in: a developer imports the SDK into a new or existing workflow; nothing already running on Canton needs to change.
 
---
 
## Implementation Plan
 
### Team
 
| Role | Background |
|---|---|
| Crystal Yang, Project Lead | Forbes 30 Under 30. ETHDenver 2026 Canton track winner. NVIDIA hackathon grand prize winner. Intel Global AI Festival winner. Leads documentation, developer experience, ecosystem coordination, and adoption program. |
| Ria Saheta, Lead Engineer | Embedded systems engineer with production experience across ESP32, STM32, and ASIC design to silicon tapeout. ETHDenver 2026 Canton track winner. NVIDIA & AWS hackathon grand prize winner. National Cyber Scholar. Leads all technical architecture, SDK development, and Daml contract design. |
 
The Canton-specific engineering in this proposal, Daml contract design, Ledger API v2 integration, on-device hashing architecture, and multi-party authorization patterns, requires the rare combination of embedded systems depth and production Canton implementation experience that Ria brings. Beet is evidence that this combination exists and can ship. Crystal leads the developer-facing work: documentation quality, tutorial production, developer outreach, and coordination with the Canton Foundation.
 
---
 
## Milestones and Deliverables
 
### Milestone 1: Generalize ETHDenver Prototype into Canton Edge-Data Architecture
 
- **Estimated Delivery:** Month 2
- **Focus:** refactor the ETHDenver-winning Beet prototype into a clean, production-grade Canton edge-data architecture that removes hackathon shortcuts and defines reusable patterns for all subsequent SDK components.
- **Deliverables / Value Metrics:**
  - Clean end-to-end architecture: device to backend to Canton Ledger API v2 to event stream to application, with all `daml script` subprocess workarounds removed
  - Reusable edge-data workflow model defining how device payloads map to Canton commands and contract events
  - On-device SHA-256 hashing module for ESP32
  - Initial Daml contract structure: device registration template, single-sensor data submission template with signatory/observer access controls
  - Architecture documentation, independently readable by a Canton developer with no hardware background
  - Public GitHub repository with contribution guidelines, issue templates, and CI setup
- **Acceptance Criteria:** end-to-end Canton hardware transaction demonstrated to committee using clean production architecture; no `daml script` subprocess workarounds present; architecture documentation published and independently readable; repository publicly accessible and indexed.
### Milestone 2: Canton-Native SDK and Daml Authorization Templates
 
- **Estimated Delivery:** Month 5
- **Focus:** build the core Canton-native SDK layer, the Daml templates, authorization patterns, and backend integration components, usable independently of any specific hardware setup.
- **Deliverables / Value Metrics:**
  - Daml Template Library: `DeviceIdentity`, `SensorDataSubmission`, `DataVerification`, `AccessControlPolicy`, `WorkflowTrigger`
  - Backend Integration Layer: Ledger API v2 gRPC client, command deduplication, event-stream subscription, connection/retry handling, with reference implementations in Python and TypeScript
  - SDK methods: `submitHashedReading`, `registerDevice`, `verifySubmission`, `streamWorkflowEvents`, all documented with typed interfaces and usage examples
  - Comprehensive test suite covering all Daml templates and SDK methods
  - Developer documentation: Daml template reference, SDK method reference, authorization pattern guide
- **Acceptance Criteria:** all Daml templates compile and pass the test suite against current stable Canton SDK; backend integration layer successfully submits commands and receives events via Ledger API v2 gRPC; SDK methods documented with typed interfaces and usage examples; **at least one Canton developer outside Beet Labs (ideally from the `daml-tooling` SIG) reviews the Daml templates and confirms the authorization patterns are correct and idiomatic**, which is the value check for this milestone, not just passing tests.
### Milestone 3: Reference Hardware Adapters and Demo Applications
 
- **Estimated Delivery:** Month 8
- **Focus:** deliver the hardware-facing layer, reference adapters for the most widely deployed microcontroller platforms, and two complete demo applications showing what edge-data workflows look like end to end.
- **Deliverables / Value Metrics:**
  - ESP32 Reference Adapter: complete firmware library, Arduino IDE / PlatformIO compatible, wiring guide
  - Raspberry Pi Reference Adapter: Python library, GPIO sensor integration examples
  - Arduino Reference Adapter: Arduino Uno / Nano variants
  - Demo Application 1, Clinical Data Anchoring: ESP32 + pulse oximeter to Canton workflow, demonstrating HIPAA-relevant access controls (patient as scoped observer, provider as signatory, compliance authority as aggregate observer); built directly on the ETHDenver-winning Beet prototype
  - Demo Application 2, Cold Chain Verification: Raspberry Pi + temperature/humidity sensor to Canton workflow, demonstrating a pharmaceutical cold-chain use case
  - Developer tutorial: step-by-step guide to building a hardware-data workflow with the SDK, no prior embedded-systems experience assumed
  - Submission to the Canton developer portal
- **Acceptance Criteria:** all three reference adapters functional and documented; both demo applications run end to end on physical hardware with Canton transactions verifiable on testnet; **developer tutorial independently validated, at least one Canton developer with no hardware background completes the tutorial and reaches a working testnet transaction**; repository submitted to and indexed on the Canton developer portal.
### Milestone 4: Developer Adoption and Ecosystem Transfer
 
- **Estimated Delivery:** Month 12
- **Focus:** get the SDK in front of Canton developers, generate real feedback, and position it for community-maintained longevity beyond the grant period.
- **Deliverables / Value Metrics:**
  - Public documentation site (SDK reference, Daml template guide, hardware adapter guides, tutorial series, FAQ), MIT licensed, hosted on GitHub Pages
  - Technical blog post co-authored with the Canton Foundation
  - Recorded walkthrough (30 to 45 minutes), published to Canton developer channels
  - Lightweight developer challenge integrated with an existing Canton community event, targeting 5 to 10 developers building a working edge-data workflow
  - Structured feedback report submitted to the Canton Foundation
  - Community handoff: GitHub governance docs, 12-month post-grant maintenance commitment, contribution guide for external developers adding Daml templates or hardware adapters
- **Acceptance Criteria:** documentation site publicly accessible; blog post published through Canton Foundation channels; recorded walkthrough published; **minimum 5 external Canton developers complete a working edge-data workflow using only published SDK documentation**, which is the milestone's real value metric, not the artifacts themselves; feedback report submitted; community maintenance structure documented and in place.
---
 
## Acceptance Criteria
 
The Tech & Ops Committee will evaluate milestone completion based on:
 
- All specified deliverables completed and submitted for review
- Demonstrated functional operation or deployment readiness as applicable
- Documentation and knowledge transfer materials provided
- Alignment with stated value metrics
Project-specific acceptance conditions are listed per milestone above. The throughline across all four is that "done" means demonstrated ecosystem value (external validation, working testnet transactions, independent developer adoption), not internal artifact checklists alone.
 
---
 
## Funding
 
**Total Funding Request: 980,000 CC (approximately $147,000 USD at $0.15/CC)**
 
For reference, a comparable, previously approved Dev Fund proposal for Canton developer tooling (Canton DevKit, a local dev environment toolkit) requested 1,900,000 CC (approximately $285,000) across four milestones over 12 months, plus an optional 600,000 CC maintenance extension.
 
### Personnel
 
No additional full-time hires are required for this scope.
 
| Role | Engagement | Cost | CC |
|---|---|---|---|
| Ria Saheta, Lead Engineer | Full-time, 12 months | $63,000 | 420,000 |
| Crystal Yang, Project Lead | Full-time, 12 months | $63,000 | 420,000 |
| **Personnel Subtotal** | | **$126,000** | **840,000** |
 
### Hardware and Testing
 
Quantities reflect development and testing needs only, not large-scale deployment.
 
| Item | Qty | Unit | Total |
|---|---|---|---|
| ESP32 development boards (WROOM, WROVER, S3 variants) | 8 | $12 | $96 |
| Raspberry Pi 4 Model B (4GB) | 4 | $75 | $300 |
| Raspberry Pi Zero 2W | 4 | $20 | $80 |
| Arduino Uno R4 | 4 | $27 | $108 |
| Arduino Nano Every | 4 | $18 | $72 |
| Pulse oximeter sensors (MAX30102), Demo App 1 | 6 | $8 | $48 |
| Temperature/humidity sensors (SHT31, DHT22), Demo App 2 | 8 | $6 | $48 |
| Breadboards, jumper wires, resistor/capacitor kits | Bulk | n/a | $80 |
| Power supplies, USB hubs, enclosures | Various | n/a | $100 |
| Replacement/spare components (15% buffer) | n/a | n/a | $140 |
| Shipping | n/a | n/a | $60 |
| **Hardware Subtotal** | | | **$1,132** |
 
### Infrastructure and Documentation
 
| Item | Detail | Cost |
|---|---|---|
| Cloud compute and CI/CD | GitHub Actions, cloud testing environments | $1,200 |
| Developer tooling and software licenses | IDEs, analysis tools | $600 |
| Documentation site hosting | GitHub Pages setup, domain | $300 |
| Technical writing review | External review pass on developer documentation and tutorial | $2,000 |
| Video production | Recorded walkthrough editing, captions, thumbnails | $2,000 |
| **Infrastructure Subtotal** | | **$6,100** |
 
### Full Budget Summary
 
| Category | USD | CC |
|---|---|---|
| Personnel | $126,000 | 840,000 |
| Hardware & Testing | $1,132 | 7,500 |
| Infrastructure & Documentation | $6,100 | 40,700 |
| Contingency (10%) | $13,323 | 88,800 |
| **Total (computed)** | **$146,555** | **approximately 977,000** |
 
Rounded to: **980,000 CC (approximately $147,000 USD)**
 
### Payment Breakdown by Milestone
 
| Milestone | CC | USD |
|---|---|---|
| M1, Canton Edge-Data Architecture | 160,000 | $24,000 |
| M2, SDK and Daml Authorization Templates | 312,000 | $46,800 |
| M3, Reference Adapters and Demo Applications | 312,000 | $46,800 |
| M4, Developer Adoption and Ecosystem Transfer | 196,000 | $29,400 |
| **TOTAL** | **980,000** | **$147,000** |
 
### Volatility Stipulation
 
The project duration is 12 months, exceeding the 6-month threshold. The grant is denominated in fixed Canton Coin. A scope and pricing checkpoint will be performed at the 6-month mark to ensure the project remains on schedule and within agreed deliverables. Should significant CC/USD price movement occur, remaining milestone payments will be renegotiated with the committee at that checkpoint.
 
---
 
## Co-Marketing
 
Upon completion of Milestone 2 (SDK and Daml template release):
 
- Coordinated announcement of the Canton Edge-Data SDK's public release with the Canton Foundation
- Technical blog post covering Daml authorization patterns for hardware contexts and Canton's privacy model in edge-data workflows
Upon completion of Milestone 3 (reference adapters and demo applications):
 
- Joint announcement of the demo applications and Canton developer portal submission
- ETHDenver-2026-to-open-ecosystem-tooling case study
Upon completion of Milestone 4 (developer adoption):
 
- Publication of the developer feedback report through Canton Foundation channels
- Co-authored technical post covering SDK adoption outcomes and community contributions
---
 
## Motivation
 
The Canton Dev Fund exists to build public-good infrastructure that benefits the entire Canton developer ecosystem. This SDK is squarely within that mandate.
 
Today, every Canton developer team that wants to incorporate physical-world sensor data into a Daml workflow must build the entire device-to-ledger integration layer from scratch: firmware, hashing pipeline, Ledger API client, Daml contract design, authorization patterns. There are no established patterns, no reusable templates, no reference implementations. The Canton Edge-Data SDK removes this repeated work permanently. Once it exists, any Canton developer can add authenticated hardware data to a workflow in a single development session rather than building the integration layer from scratch.
 
**On sizing:** there is no precise count of Canton developers specifically working on hardware/edge-data use cases, since that category is not yet a tracked segment. What is available: the Canton Foundation's Q1 2026 Developer Experience survey identified 41 active developers ecosystem-wide (80% of whom joined in the last 12 months), and Canton Wiki's ecosystem tracker counts 184+ projects, heavily concentrated in exactly the regulated, physical-asset-adjacent verticals this SDK targets: custody (DTCC, Broadridge's repo platform), trade settlement (Tradeweb, Euroclear), and institutional post-trade infrastructure. This is the basis for the M4 target: **5 external developers completing a working edge-data workflow represents roughly 12% of the current active-developer base.** If this target is met, the natural follow-on is for the Foundation's existing pharma/custody relationships to pilot the SDK on a real production workflow; that pilot would be its own, separate proposal.
 
This is the same class of public-good contribution as the Daml training curriculum and prior developer-tooling proposals previously funded: infrastructure that benefits the entire ecosystem and does not need to be rebuilt by each team independently.
 
### Adoption Plan
 
The primary target users are existing Canton and Daml developers, not generic hardware engineers:
 
- **Canton developer portal submission** at Milestone 3, making the SDK discoverable to the existing developer community without active marketing
- **Technical blog post and walkthrough** at Milestone 4, reaching developers through existing Foundation channels at no separate marketing cost
- **Lightweight developer challenge** integrated with an existing Canton community event rather than a standalone hackathon; the goal is developer feedback from 5 to 10 developers, not event scale
- **Daml consulting network**: the `daml-tooling` SIG review built into M2's acceptance criteria creates a direct connection to experienced Canton developers who can validate the SDK and introduce it to their networks
- **Follow-on application pilots**: application-specific pilots (for example, a pharmaceutical firm integrating cold-chain sensors into an existing Daml workflow) are the natural next step once the SDK is validated, proposed separately once the tooling exists and has been tested by external developers
---
 
## Rationale
 
**Why does Canton need this SDK rather than relying on teams building their own integrations?** Every team incorporating hardware data into a Canton workflow today faces the same unsolved problems: Daml contract design for device identity and submission, signatory/observer patterns for regulated hardware data, a reliable Ledger API v2 backend, and Canton's specific privacy requirements. Without shared tooling, each team solves this independently, with inconsistent results, duplicated effort, and no shared community knowledge.
 
**Why Canton rather than other chains for regulated edge data?** Traditional databases require trusting the application operator. Public blockchains expose transaction data to all participants, categorically unsuitable for regulated hardware data. Generic permissioned chains typically rely on application-layer access control that can be bypassed by software bugs or misconfiguration. Canton's Daml authorization model enforces who can see what at the ledger level, through the contract model itself. For hardware data subject to HIPAA, FDA 21 CFR Part 11, GDPR, or commercial confidentiality requirements, this distinction is not a preference, it is the threshold requirement. Canton is the only production blockchain that meets it.
 
**Why this team?** The Canton Edge-Data SDK requires a rare combination of production embedded-systems experience and production Canton/Daml implementation knowledge. Beet is proof that this combination exists in Ria and Crystal: a working end-to-end hardware-to-Canton integration, validated under live competition conditions at ETHDenver 2026, judged by Canton's own technical team. This proposal generalizes that validated architecture into reusable tooling. The work is already partially done; what remains is the engineering to make it production-grade, reusable, and well-documented for the Canton developer community.
 
**Why MIT licensing?** Proprietary tooling creates adoption bottlenecks and concentrates control. An openly licensed SDK with clear documentation becomes a community asset that Canton developers can use, extend, and contribute to without friction. Every Canton team that builds on the SDK strengthens the shared infrastructure layer rather than duplicating it.
 
**Long-term maintenance:** the SDK will be actively maintained by Beet Labs for a minimum of 12 months post-grant delivery, covering bug fixes, security patches, dependency updates, and community PR review. Community contribution infrastructure is established from Milestone 3 onward, enabling external Canton developers to add new Daml templates or hardware adapters independently. Unlike proposals that involve recurring paid infrastructure (hosted APIs, ongoing service costs), this maintenance commitment has no ongoing cost to the fund; it's a standing commitment from the team, not a milestone deliverable.
 
**On the funding ask:** this reflects our itemized costs for the full scope described above. We welcome Committee feedback on scope and amount.
 
---
 
## Risks and Mitigations
 
| Risk | Likelihood | Mitigation |
|---|---|---|
| Daml template design requires more iteration than anticipated | Medium | `daml-tooling` SIG / external developer review built into M2 acceptance criteria catches design issues before M3 hardware work begins |
| Hardware supply chain delays | Low | Hardware quantities are small; standard components available from multiple suppliers; 15% spare-component buffer included |
| Low external developer uptake at M4 | Medium | Developer challenge integrated with existing Canton events minimizes friction; documentation site and walkthrough video reduce onboarding barrier; target of 5 developers represents approximately 12% of the Foundation's own surveyed active-developer base |
| Edge-data is not yet a top developer-tooling priority per the Q1 2026 survey | Acknowledged | This proposal is framed as infrastructure for Canton's existing institutional verticals (custody, pharma-adjacent, trade finance), not as a response to the survey's top-voted asks (local dev frameworks, debugging); those gaps are better addressed by teams with that specific expertise |
| Canton Ledger API v2 changes during development | Low | SDK targets stable Ledger API v2 interfaces; architecture documentation notes any version dependencies |
| Demand from Canton enterprise clients not yet established | Acknowledged | This proposal builds the tooling layer first; application-specific demand validation and enterprise pilots are the natural follow-on once the SDK exists and is tested; the Foundation's existing relationships in pharma and supply chain are the target audience for those follow-on conversations |
