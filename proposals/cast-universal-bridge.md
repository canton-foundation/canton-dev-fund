## Development Fund Proposal

**Author:** [Your Name / Organization]
**Status:** Submitted
**Created:** 2024-02-21

---

## Abstract
This proposal introduces **Cast**, a developer experience (DX) primitive that transforms how external systems interact with the Canton Network. It is a CLI tool and lightweight gateway that automatically generates application-specific, fully-typed OpenAPI v3.1 schemas directly from Daml Smart Contracts (`.dar` files). 

More than just a generator, Cast embeds a state-of-the-art **Scalar Reference UI** accessible instantly via a `/reference` endpoint upon deployment, and unlocks the ability to generate Type-Safe SDKs for any language (TypeScript, Python, Java, Go) using standard `openapi-generator` tools. This drastically reduces the integration friction for enterprise backend and frontend teams building on Canton.

---

## Specification

### 1. Objective
Currently, the Canton JSON Ledger API provides a *generic* OpenAPI definition. It exposes endpoints like `POST /v1/create` but expects arbitrary `{}` JSON payloads, forcing developers to manually map Daml structures (Templates, Choices, Records) to their frontend or backend code. This lack of type-safety leads to runtime errors, slow integration cycles, and a steep learning curve for non-Daml engineers.

The objective is to eliminate this friction by providing **Cast**, a tool that bridges the gap between Daml's strict type system and the enterprise-standard OpenAPI ecosystem. 

### 2. Implementation Mechanics
The solution consists of three core components:

1. **AST Schema Compiler (CLI):** 
   A tool (e.g., `npx cast` or a native binary) that decompiles a `.dar` package, parses the Daml Abstract Syntax Tree (AST), and maps Daml primitives (Text, Int, Lists, Records, Variants) into a strictly-typed OpenAPI v3.1 Specification (`openapi.yaml`).

2. **The `/reference` Gateway UI:**
   Instead of the outdated generic Swagger UI, the tool provides a lightweight proxy/gateway (or an embeddable middleware). When deployed alongside a Canton node, navigating to `https://node-url/reference` will serve a modern, dark-themed **Scalar UI**. This interactive documentation will show exact request/response bodies for specific contracts (e.g., `POST /contract/BankAccount/Withdraw`) complete with live cURL, Python, and TypeScript code snippets.

3. **Multi-Language SDK Generation Pipeline:**
   By producing standard OpenAPI schemas, we unlock the `openapi-generator-cli` ecosystem. We will provide automated CI/CD templates demonstrating how changes to a Daml contract can automatically publish strongly-typed SDK packages for Java, Python, Go, and TypeScript.

### 3. Architectural Alignment
This project aligns perfectly with **[CIP-0082 / CIP-0100] Developer Tooling and Critical Infrastructure**. It is a pure "Public Good" that does not alter Daml or Canton consensus rules but dramatically improves the application-layer (HTTP/JSON API) integration experience.

### 4. Backward Compatibility
*No backward compatibility impact.* 
This is strictly an additive developer tooling layer that consumes existing `.dar` files and wraps the existing Canton JSON API.

---

## Milestones and Deliverables

### Milestone 1: Core Daml-to-OpenAPI Compiler
- **Estimated Delivery:** 4 Weeks
- **Focus:** AST parsing and OpenAPI schema generation.
- **Deliverables / Value Metrics:** 
  - A CLI tool capable of converting complex `.dar` files into valid `openapi.yaml`.
  - Support for mapping Daml Templates, Choices, Records, and Enums to JSON Schema.
  - Comprehensive unit tests against standard Daml design patterns.

### Milestone 2: Scalar UI & Gateway Integration (`/reference`)
- **Estimated Delivery:** 3 Weeks
- **Focus:** Developer Interface and API Proxy.
- **Deliverables / Value Metrics:** 
  - A lightweight server/proxy that wraps the Canton JSON API.
  - Integration of the modern Scalar UI served automatically at the `/reference` route.
  - Live API interaction capabilities (Try-it-out) directly from the browser, using contract-specific payloads.

### Milestone 3: Multi-Language SDK Templates & CI/CD Tooling
- **Estimated Delivery:** 3 Weeks
- **Focus:** End-to-end DX and Enterprise Adoption.
- **Deliverables / Value Metrics:** 
  - Official documentation and GitHub Action templates showing how to auto-generate Next.js (TypeScript), Spring Boot (Java), and FastAPI (Python) SDKs from the generated OpenAPI spec.
  - An example full-stack repository demonstrating the complete "Daml to Mobile/Web" type-safe workflow.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
- **Compliance:** Successful generation of 100% compliant OpenAPI v3.1 schemas from complex `.dar` files.
- **Operational Readiness:** Ability to execute a contract `Choice` via the Scalar UI without manually crafting generic JSON payloads.
- **Tooling Validation:** Successful automated compilation of a TypeScript and Python SDK using standard `openapi-generator` against the output.
- **Open Source:** Release under Apache 2.0 or MIT license with clear documentation.

---

## Funding

**Total Funding Request:** [To Be Determined e.g., 50,000 CC] 

### Payment Breakdown by Milestone
- Milestone 1 (Core Compiler): 40% upon committee acceptance
- Milestone 2 (Scalar Gateway): 30% upon committee acceptance
- Milestone 3 (SDK Tooling): 30% upon final release and acceptance

### Volatility Stipulation
If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Motivation
A network's growth is bottlenecked by the speed at which external systems (frontends, legacy banking backends, mobile apps) can integrate with it. Currently, non-Daml engineers face significant friction when interacting with Canton's generic JSON Ledger API. By providing standard OpenAPI schemas and a beautiful, interactive reference UI, we remove the learning curve. Canton becomes as easy to integrate as the Stripe or Twilio API, attracting a massive pool of standard web developers.

---

## Rationale
Standardizing on OpenAPI unlocks the massive, existing open-source ecosystem of code generators. Rather than building bespoke client libraries, **Cast** leverages the `openapi-generator` suite to support 50+ languages instantly. Choosing **Scalar** over traditional Swagger ensures a premium developer experience that aligns with Canton’s mission to be the leading institutional blockchain.

---

## Risks and Mitigations
- **Risk: Breaking changes in Daml-LF.**  
  - *Mitigation:* Using official Daml SDK libraries for AST parsing to ensure long-term compatibility.
- **Risk: Complexity of recursive Daml types.**  
  - *Mitigation:* Implementing a robust mapping layer that correctly handles deeply nested records and variants into JSON Schema.

---

## Team and Capabilities
[Insert Name/Team] brings deep expertise in [Daml, Web2 Integration, CLI Tooling]. We have a proven track record of building developer tools that bridge complex backend systems with modern frontend frameworks.

---

## References
- Daml JSON API Reference: [Link](https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html)
- Scalar API Documentation: [https://scalar.com/](https://scalar.com/)
- OpenAPI Specification v3.1: [https://www.openapis.org/](https://www.openapis.org/)
