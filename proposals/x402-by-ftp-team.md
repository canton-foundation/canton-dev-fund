## Development Fund Proposal — x402 Protocol Integration for Canton

Author: Denend | FTP  
Status: Submitted  
Created: 2026-03-12  

---

## Abstract

x402 is an open HTTP payment protocol that has already processed 75M+ transactions across $24M+ in volume. It allows any server to require payment for any API response using a single middleware line, with no accounts, API keys, or manual billing flows. It is purpose-built for autonomous AI agents. Every major EVM chain, Solana, and several others already have live x402 facilitators. Canton does not.

This proposal delivers:

1. A Canton x402 Facilitator — the /verify and /settle service, accompanied by a formal scheme specification submitted upstream to the x402 repository, enabling Canton Coin to appear as a selectable payment scheme in any x402 accepts arra

2. A Canton x402 Client SDK - a library for the payer side (developers and autonomous agents) to interact with Canton-settled x402 endpoints.

3. A Canton x402 Resource Server Middleware - drop-in server-side middleware so Canton builders can gate any API endpoint behind Canton Coin payment in minutes.

4. CanTrustAI as the canonical reference implementation - a live, production deployment of a Canton-settled x402 resource server, demonstrating the full stack end-to-end.

CanTrustAI's infrastructure was already deployed (smart contracts, on-chain payment settlement, production UI), which serves as the empirical foundation for this proposal. Forward development is funded across three milestones at 400,000 CC / 400,000 CC / 200,000 CC, for a total of 1,000,000 CC.

---

# Motivation

## The x402 Opportunity

x402 reuses HTTP's dormant 402 Payment Required status code to embed payment flows natively into API requests. A server that wants to charge per request responds with a 402 containing payment requirements; the client pays and retries; the server verifies and fulfills. No accounts. No API keys. No billing relationships. The entire flow is stateless and machine-readable by design — which is why it is rapidly becoming the default payment layer for autonomous AI agents.

The protocol is already live at scale. It is chain-agnostic by specification: the accepts field in a 402 response can enumerate any number of networks and payment schemes. The facilitator architecture means a new chain does not require changes to the core protocol — it requires only a new facilitator implementation that speaks to the target chain's settlement layer.

## Canton Is Currently Absent

Canton Coin is not listed among x402's supported networks. This means:

- Canton builders cannot add x402 payment middleware to their APIs without writing custom facilitator infrastructure from scratch.
- AI agents with Canton wallets cannot pay for x402-gated services.
- Canton Coin is absent from an emerging machine-payment ecosystem that is already at production scale on competing chains.

This is a concrete, remediable gap. The x402 facilitator interface is well-specified. The Canton ledger API is well-specified. The integration work is tractable and has a clear output: Canton Coin becomes a selectable payment scheme in any x402 accepts array.

## Why the Development Fund Should Care

CIP-0082 names "dev tools, reference implementations, and critical infra" as explicit targets for the development fund. A Canton x402 facilitator is squarely in all three categories:

- It is developer tooling — a Canton builder can add one middleware line and accept Canton Coin for any API.
- It is a reference implementation — CanTrustAI demonstrates the full stack in production with real transaction history.
- It is critical infrastructure — without it, Canton Coin is structurally excluded from x402's agent payment economy, which is the payment layer most likely to drive sustained, programmatic on-chain volume at scale.

---

# Specification

## 1. Objective

Problem: Canton Coin has no x402 facilitator. As x402 becomes the default payment protocol for AI agent infrastructure and API monetisation, Canton's absence means:

- Canton builders cannot monetise APIs in a way that is compatible with the emerging agent-payment ecosystem.
- AI agents that hold Canton wallets cannot access x402-gated services.
- The Canton network misses a growing source of programmatic, usage-driven transaction volume.

Outcome: A complete, maintained Canton x402 integration stack — facilitator, client SDK, resource server middleware — that is protocol-compliant with the x402 spec, listed in the x402 ecosystem directory, and demonstrably functional via CanTrustAI in production.

Success looks like:

- Canton Coin is a selectable scheme in x402's accepts field, supported by a live facilitator with documented uptime.
- A Canton builder can gate an API endpoint behind Canton Coin payment by adding a single middleware import and configuration block.
- An autonomous AI agent holding a Canton wallet can access any x402-endpoint that accepts Canton Coin, with no human intervention.
- CanTrustAI serves as a publicly documented, production-grade reference implementation of the full stack.
- Canton is listed in the x402 ecosystem directory as a supported network with a live facilitator.

---

## 2. Delivered Work 

Before this grant program existed, the following was built and deployed:

### CanTrustAI v1 — Live on Canton Mainnet https://www.cantrustai.xyz/

- On-chain payment settlement: Smart contracts deployed on Canton mainnet handling payment authorisation and settlement in Canton Coin and supported stablecoins. Each inference request is a settled Canton ledger transaction.

- Unified AI gateway: A production API gateway routing inference requests to Claude (Anthropic), Gemini (Google), and GPT-4/OpenAI, with per-provider authentication, billing, and response normalisation.

- Production frontend: A working user interface for developers and end users to manage balances, submit inference requests, and monitor usage.

Visualization of the architecture - https://cdn.ftptech.xyz/cantrustai_architecture.html

This deployment is the empirical proof that Canton Coin can function as a payment settlement layer for per-request API access — the exact model x402 formalises at the protocol level.

---

## 3. Forward Development Workstreams

### Workstream A — Canton x402 Facilitator (Milestone 1)

The facilitator is the server-side service that sits between a resource server and the Canton ledger. It exposes two endpoints per the x402 spec:

- POST /verify — validates a client's payment payload against the resource server's declared payment requirements, without yet settling.

- POST /settle — submits the validated payment payload to the Canton ledger and returns a settlement response.

By running this facilitator, any resource server can accept Canton Coin payments without maintaining its own Canton node, implementing Canton gRPC client logic, or handling ledger-level payment verification.

Key design decisions:

- Stateless verification against signed Canton Coin transfer payloads.
- Duplicate settlement protection (equivalent to the settlement cache pattern in the x402 SVM reference implementation).
- Configurable Canton node endpoint, party ID, and settlement timeout.
- Public facilitator deployment operated by FTP for ecosystem use, plus open-source code so any party can self-host.

Alongside the facilitator implementation, we will produce a formal scheme specification (scheme_exact_canton.md) following the structure established by the SVM integration, and submit it upstream to the x402 repository as the canonical description of Canton's payment scheme.

---

### Workstream B — Canton x402 Client SDK (Milestone 2)

A client-side library for developers and autonomous agents that want to pay for x402-gated services using Canton Coin. The client handles:

- Detecting a 402 Payment Required response and parsing the PAYMENT-REQUIRED header.
- Selecting the Canton Coin payment scheme from the server's accepts field.
- Constructing and signing a Canton Coin payment payload.
- Retrying the original request with the PAYMENT-SIGNATURE header.
- Handling PAYMENT-RESPONSE and exposing settlement metadata to the caller.

The SDK is designed to be usable both by human developers (standard async library) and by autonomous AI agents (no interactive steps, fully programmatic).

---

### Workstream C — Resource Server Middleware (Milestone 2)

A drop-in middleware package for Canton builders to add x402 payment gating to any HTTP API endpoint. Mirrors the ergonomics of the existing x402 TypeScript middleware:

```javascript
app.use(
  cantonPaymentMiddleware({
    "GET /api/data": {
      accepts: [cantonCoinScheme],
      price: "1.0",
      description: "Access to dataset endpoint",
    },
  })
);
```

The middleware handles the full x402 flow server-side: emitting 402 responses with correct PAYMENT-REQUIRED headers, delegating verification and settlement to the Canton facilitator, and releasing the response on successful payment.

---

### Workstream D — CanTrustAI Reference Implementation (Milestone 3)

CanTrustAI is refactored and documented as the canonical end-to-end reference implementation of the Canton x402 stack.

---

# Milestones and Deliverables

## Milestone 1: Canton x402 Facilitator

Estimated Delivery: 2026-05-30  
Funding: 400,000 CC upon committee acceptance of delivery

Deliverables:

- Canton x402 facilitator live at a public endpoint, with /verify and /settle compliant with the x402 facilitator spec.
- Open-source facilitator repository with deployment documentation.
- Compatibility matrix: tested against current Canton ledger API version and documented supported Canton Coin denominations.
- Canton x402 payment scheme specification (specs/schemes/exact/scheme_exact_canton.md) covering Canton's payment model and transaction semantics, payload structure, signing and verification flow, and how Canton maps to the x402 scheme/network abstraction — submitted as part of an upstream PR to the x402 repository.
- General submission to the x402 ecosystem directory for inclusion as a supported Canton network facilitator.

Acceptance criteria:

- /verify and /settle endpoints behave per the x402 facilitator spec under normal and error conditions.
- A committee member or delegate can send a test payment payload to the live facilitator and receive a valid verification and settlement response.

---

## Milestone 2: Canton x402 Client SDK + Resource Server Middleware

Estimated Delivery: 2026-07-15  
Funding: 400,000 CC upon committee acceptance of delivery

Deliverables:

- Canton x402 client SDK published to a public package registry.
- Canton x402 resource server middleware published.
- Developer tutorial.
- End-to-end integration test.

---

## Milestone 3: CanTrustAI Reference Implementation + Ecosystem Close-out

Estimated Delivery: 2026-07-30  
Funding: 200,000 CC upon committee acceptance of delivery

Deliverables:

- CanTrustAI migrated to use the Canton x402 facilitator and middleware.
- Public reference guide.
- Mainnet transaction demonstrating end-to-end x402 payment flow.
- Maintenance playbook.

---

# Architectural Alignment

The Canton x402 stack aligns with Canton architecture at several levels.

Ledger settlement as the source of truth.

Privacy-preserving payment flows.

Agent compatibility.

Open standard, not vendor lock-in.

---

# Backward Compatibility

The Canton x402 facilitator is additive to the Canton ecosystem. It does not require changes to Canton core, Splice, or Daml.

---

# Funding

Total Funding Request: **1,000,000 CC**


Milestone 1 — Canton x402 Facilitator  
400,000 CC

Milestone 2 — Client SDK + Resource Server Middleware  
400,000 CC

Milestone 3 — CanTrustAI Reference Implementation + Ecosystem Close-out  
200,000 CC

---

# Volatility Stipulation

Per CIP-0100:

- Milestone 1 funding fixed in Canton Coin.
- Milestones 2 and 3 subject to renegotiation if CC/USD moves ±40%.

---

# Co-Marketing

Upon each milestone delivery, FTP will collaborate with the Canton Foundation.

Milestone 1 announcement.

Milestone 2 developer tutorial promotion.

Milestone 3 case study post.

---

# Rationale

Why x402 specifically?  
x402 is the credibly neutral, open-source standard for machine-to-machine HTTP payments.

Why a facilitator rather than a Canton-specific payment protocol?  
The facilitator pattern is precisely designed for new chain integrations.

Why is CanTrustAI the right reference implementation?  
Because it is already live.

Why does this serve the broader Canton ecosystem, not just FTP?  
The facilitator, client SDK, and middleware are open-source general-purpose infrastructure.
