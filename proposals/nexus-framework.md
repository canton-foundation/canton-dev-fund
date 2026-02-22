## Development Fund Proposal: Nexus Framework

**Author:** Mehmet Kar
**Status:** Draft / Submitted
**Created:** 2026-02-22

---

## Abstract
This proposal introduces the **Nexus Framework (NXFS)**, a developer experience (DX) powerhouse designed to bridge the chasm between the Canton Ledger and modern web ecosystems (Next.js, React, TanStack). Nexus is a type-safe **ORPC (Object Remote Procedure Call)** layer that transforms Daml Smart Contracts into a seamless, high-performance frontend developer experience.

By automating Isomorphic Authentication, Consensus-Aware State Syncing, and Strict Type-Safe API Generation, Nexus Framework eliminates the repetitive boilerplate and architectural friction that currently hinders the rapid adoption of the Canton Network by mainstream web engineering teams.

---

## Specification

### 1. Objective
The goal of **Nexus Framework** is to consolidate fragmented frontend developer patterns into a single, high-performance "Standard Library." Nexus moves beyond simple hooks, providing a modular architecture that makes building on Canton as developer-friendly as building a standard Web2 app with tools like Stripe or Twilio, while ensuring **100% compatibility with modern React 19+ and Next.js 15+ standards**.

### 2. Implementation Mechanics
The Nexus Framework architecture is comprised of three core modules designed to work independently or as a unified stack:

**A. The Type-Safe ORPC Engine**
Nexus consumes standard OpenAPI schemas and produces a strictly-typed TypeScript client.
*   **Query Options Factory:** Automatically generates `queryOptions` and `queryKey` objects for TanStack Query, enabling deep integration with React query-caching.
*   **Semantic Cache Management:** Uses Daml template structures to automatically invalidate related caches upon transaction success.

**B. Isomorphic Auth & Identity**
A headless authentication module that manages the entire SIWC (Sign-In with Canton) flow.
*   **Wallet Bridging:** Seamlessly maps Browser Wallets (Metamask, Console) to Canton Party IDs.
*   **Secure Session Management:** Handles server-side JWT generation and secure `HttpOnly` cookie-based sessions, enabling SSR compatibility in Next.js.

**C. Consensus-Aware Sync (Waiters)**
Standalone, pluggable modules to observe transaction finality on the ledger.
*   **Finality Observers:** Middleware-level observers that wait for ledger consensus before resolving mutation hooks, ensuring a consistent UI state without race conditions.

**Technical Workflow**
```mermaid
graph TD
    Daml[Daml Smart Contracts] -->|Schema Discovery| OA[OpenAPI Spec]
    OA -->|Nexus Codegen| TS[Generated TS Client]
    TS -->|Nexus Auth| Auth[Authenticated Session]
    Auth -->|Nexus Data| UI[useQuery / useMutation]
    UI -->|Nexus Waiter| CM[Consensus Confirmed]
```

### 3. Architectural Alignment
This work directly aligns with Canton architecture and ecosystem priorities by modernizing the interface between the ledger and front-end applications. It provides a version-agnostic adapter layer to help transition seamlessly across Canton updates (e.g. Canton 3.0), thus improving scalability, security, and developer adoption.

### 4. Backward Compatibility
*No backward compatibility impact.* This is an additive developer framework and tooling suite that sits on top of existing Canton APIs (JSON API, Ledger API).

---

## Milestones and Deliverables

### Milestone 1: Core Framework & Isomorphic Auth
- **Estimated Delivery:** 4 Weeks
- **Focus:** 
  - Core `@nexus-framework/core` package.
  - Unified SIWC authentication flow with Metamask and Console support.
  - Basic ledger connectivity and JWT session management.
- **Deliverables / Value Metrics:** 
  - Instant secure connection for dApps.
  - Successful wallet-to-session conversion in < 2 seconds.

### Milestone 2: TanStack Adapter & Async Sync Engine
- **Estimated Delivery:** 3 Weeks
- **Focus:** 
  - Codegen engine for `queryOptions` and `queryKey`.
  - Next.js Server Actions integration layer.
  - Automated cache invalidation logic.
- **Deliverables / Value Metrics:** 
  - 10x faster frontend development with zero runtime type errors.
  - 100% end-to-end TypeScript safety from Daml Choice to React Hook.
  - Successful data fetching within a Server Component using a secure session cookie.

### Milestone 3: Consensus Observers & CLI Tooling
- **Estimated Delivery:** 3 Weeks
- **Focus:** 
  - WebSocket-based Finality Waiters.
  - `create-nexus-app` CLI for project scaffolding.
  - Headless UI Status components.
- **Deliverables / Value Metrics:** 
  - Production-ready UX with built-in consensus tracking.
  - Transaction mutation resolving only AFTER ledger finality event is captured.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- 100% end-to-end TypeScript safety from Daml Choice to React Hook
- Successful wallet-to-session conversion in < 2 seconds
- Transaction mutation resolving only AFTER ledger finality event is captured
- Successful data fetching within a Server Component using a secure session cookie

---

## Funding

**Total Funding Request:** 450,000 CC

### Payment Breakdown by Milestone
- Milestone 1: 150,000 CC upon committee acceptance
- Milestone 2: 150,000 CC upon committee acceptance
- Milestone 3: 150,000 CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for the Nexus Framework
- Case study or technical blog on solving the Canton integration tax
- Developer or ecosystem promotion for Next.js & React communities

---

## Motivation
The current Canton frontend ecosystem is fragmented, leading to what developers call a significant "Integration Tax." Community research across Daml Discourse, StackOverflow, and GitHub identifies four critical bottlenecks:

1. **Auth & Wallet Chaos:** Developers frequently report that mapping Browser Wallets to Canton Party IDs and managing short-lived JWTs is a "black box" that requires weeks of custom infrastructure work.
2. **Modern React Incompatibility:** The legacy `@daml/react` suite often conflicts with **React 18/19 Concurrent Mode** and the latest **Streaming/Suspense** features, forcing teams to use outdated React versions.
3. **The Next.js SSR Gap:** Current tools are client-side only, leaving no clear path for developers to leverage **Next.js Server Components** or **Server-Side Rendering (SSR)** with the Canton ledger.
4. **API Fragmentation:** Engineers are often forced to juggle between gRPC, JSON API, and dApp API, leading to brittle and complex codebases.

---

## Rationale
While generic ORPC tools exist, they are "Ledger Blind." Nexus Framework is built specifically for the unique asynchronous and consensus-driven nature of Canton:
*   **Finality Awareness:** Unlike standard tools that resolve on `HTTP 200`, Nexus resolves on **Consensus**.
*   **Canton-Native Auth:** Automates the complex Wallet-to-JWT-to-Party mapping that generic auth providers cannot handle.
*   **Developer Experience:** Provides a seamless "Daml-to-UI" type-safety pipeline.

---

## References
*   **Canton Network Official:** [https://www.canton.network/](https://www.canton.network/)
*   **Daml Ledger API:** [https://docs.daml.com/app-dev/ledger-api.html](https://docs.daml.com/app-dev/ledger-api.html)
*   **Daml JSON API Documentation:** [https://docs.daml.com/json-api/index.html](https://docs.daml.com/json-api/index.html)
*   **TanStack Query Standards:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
*   **OpenAPI Specification:** [https://www.openapis.org/](https://www.openapis.org/)
