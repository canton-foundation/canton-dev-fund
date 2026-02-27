# Framework-Agnostic Frontend Libraries

*Author:* İlker Güzelkokar
*Status:* Submitted
*Created:* 2026-02-24
*Project Name:* DAML Svelte & Vue Framework Libraries (DSFV)

---

## Abstract

This proposal introduces *dedicated framework-specific libraries for Svelte and Vue* — @daml/svelte and @daml/vue — to extend the Canton Network's frontend developer ecosystem beyond React. Currently, only @daml/react provides framework-specific bindings; developers using Svelte or Vue must work directly with the low-level @daml/ledger package, resulting in significant boilerplate, poor DX, and a high barrier to entry.

By providing *idiomatic, reactive, and type-safe bindings* tailored to each framework's paradigm (Svelte Stores/Runes for Svelte, Composables for Vue), this project will unlock two of the web's fastest-growing frontend communities for Canton Network adoption.

---

## Specification

### 1. Objective

The Canton frontend ecosystem currently has a *critical framework coverage gap*. Web research confirms:

| Framework | npm Weekly Downloads | DAML Library | Status |
|-----------|---------------------|--------------|--------|
| React | ~25M | @daml/react | ✅ Official hooks |
| Vue | ~5M | — | ❌ No bindings |
| Svelte | ~1.5M | — | ❌ No bindings |

Developers using Vue or Svelte face three major pain points:

1. *Manual Ledger Wiring:* Every team must independently implement contract querying, command submission, and streaming — logic that @daml/react provides out-of-the-box for React developers.
2. *No Reactive Integration:* The @daml/ledger package returns raw promises; mapping these into Svelte stores or Vue reactive refs requires significant custom infrastructure.
3. *Missing Auth Patterns:* No established patterns exist for mapping authenticated sessions to Canton Party IDs in Svelte/Vue applications, unlike the React ecosystem.

The goal is to provide *first-class, framework-native DAML integration* that makes building Canton dApps in Svelte or Vue as seamless as it is in React.

### 2. Implementation Mechanics

#### A. @daml/svelte — Svelte Store-Based Bindings

Leverages Svelte's *reactive store system* (including Svelte 5 Runes) to provide:

- *createDamlStore(template, query?)* — Returns a readable Svelte store that auto-subscribes to contract streams via @daml/ledger. Uses Svelte's $ auto-subscription syntax.
- *createDamlKeyStore(template, key)* — Fetch-by-key store with reactive key tracking.
- *damlLedger context* — A Svelte context provider wrapping @daml/ledger initialization, party configuration, and JWT management.
- *exerciseChoice(template, choice, args)* — Reactive command submission with built-in loading/error states as derived stores.
- *WebSocket streaming* — Stores automatically reflect real-time ledger changes, leveraging Svelte's compile-time reactivity for zero-overhead updates.

svelte
<script>
  import { getDamlContext, createDamlStore } from '@daml/svelte';
  import { Asset } from '../daml/Main';

  const ctx = getDamlContext();
  const assets = createDamlStore(Asset);

  // $assets auto-subscribes — Svelte magic
</script>

{#each $assets as asset}
  <p>{asset.payload.owner}: {asset.payload.name}</p>
{/each}

#### B. @daml/vue — Composition API Bindings

Leverages Vue's *Composition API and Composables* to provide:

- *useDamlQuery(template, query?)* — Returns reactive ref<Contract[]> with auto-fetching and streaming. Integrates with Vue's watchEffect for dependency tracking.
- *useDamlFetchByKey(template, key)* — Reactive key-based contract lookup.
- *useDamlParty()* — Returns the current party as a reactive ref.
- *useDamlLedger()* — Provides the Ledger instance via Vue's inject/provide pattern.
- *useDamlMutation(template, choice)* — Command submission composable with reactive isLoading, error, and data refs.
- *Pinia store integration (optional)* — Pre-built Pinia store factories for advanced state management patterns.

vue
<script setup>
import { useDamlQuery, useDamlParty } from '@daml/vue';
import { Asset } from '../daml/Main';

const party = useDamlParty();
const { contracts, loading, error } = useDamlQuery(Asset);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="asset in contracts" :key="asset.contractId">
      {{ asset.payload.owner }}: {{ asset.payload.name }}
    </li>
  </ul>
</template>

#### C. Shared Core (@daml/framework-core)

A framework-agnostic core layer that both libraries consume:

- *Stream Manager:* Handles WebSocket lifecycle, automatic reconnection, and event normalization.
- *Auth Provider Interface:* Standardized JWT/Party ID resolution that both Svelte and Vue adapters consume.
- *Type Codegen Integration:* Works seamlessly with daml codegen js output.
- *Error Handling:* Standardized error types and retry logic.

#### Technical Architecture

mermaid
graph TD
    Daml[Daml Contracts] -->|daml codegen js| Types["Generated TypeScript Types"]
    Types --> Core["@daml/framework-core"]
    Core --> Svelte["@daml/svelte"]
    Core --> Vue["@daml/vue"]
    Core --> Ledger["@daml/ledger (JSON API)"]
    Svelte -->|Svelte Stores/Runes| SvelteApp["Svelte/SvelteKit App"]
    Vue -->|Composables/Pinia| VueApp["Vue/Nuxt App"]
    Ledger -->|HTTP/WS| Canton["Canton Ledger"]

### 3. Architectural Alignment

This project directly addresses the *Developer Tooling* priority defined in CIP-0082/CIP-0100. It is a pure "Public Good" that expands the Canton ecosystem's frontend reach from 1 framework (React) to 3 frameworks, multiplying the potential developer pool.

The architecture mirrors the proven @daml/react → @daml/ledger pattern, ensuring consistency across the ecosystem while respecting each framework's idiomatic patterns.

### 4. Backward Compatibility

No backward compatibility impact.
These are purely additive packages. They consume the existing Canton JSON Ledger API and @daml/ledger package without modification. The @daml/react library remains unaffected.

---

## Milestones and Deliverables

### Milestone 1: Shared Core & @daml/svelte v1.0

- *Estimated Delivery:* 5 Weeks
- *Focus:* Framework-agnostic core layer and complete Svelte bindings.
- *Deliverables / Value Metrics:*
  - @daml/framework-core package with stream manager, auth interface, and error handling.
  - @daml/svelte package with store-based contract queries, streaming, and command submission.
  - Svelte context provider for ledger configuration and party management.
  - Svelte 5 Runes compatibility.
  - SvelteKit SSR support for server-side contract fetching.
  - Unit and integration test suite with 80%+ coverage.
  - Documentation with quickstart guide, API reference, and migration guide from raw @daml/ledger.
  - Example SvelteKit dApp demonstrating full CRUD operations on Daml contracts.

### Milestone 2: @daml/vue v1.0

- *Estimated Delivery:* 4 Weeks
- *Focus:* Complete Vue Composition API bindings.
- *Deliverables / Value Metrics:*
  - @daml/vue package with composables for contract queries, streaming, mutations, and party management.
  - Vue provide/inject integration for ledger context.
  - Optional Pinia store factories for advanced state management.
  - Nuxt 3 SSR support for server-side contract fetching.
  - Unit and integration test suite with 80%+ coverage.
  - Documentation with quickstart guide, API reference, and composable catalog.
  - Example Nuxt 3 dApp demonstrating full CRUD operations on Daml contracts.

### Milestone 3: Advanced Features, CLI & Ecosystem Integration

- *Estimated Delivery:* 3 Weeks
- *Focus:* Developer onboarding tools, advanced patterns, and ecosystem alignment.
- *Deliverables / Value Metrics:*
  - create-daml-svelte and create-daml-vue CLI scaffolding tools.
  - WebSocket streaming with automatic reconnection and fallback.
  - Multi-party support patterns for both frameworks.
  - Comprehensive comparison guide: React vs. Svelte vs. Vue patterns for Daml.
  - End-to-end example dApps for both frameworks deployed to Canton Sandbox.
  - npm package publication and community launch.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- *API Parity:* Feature parity with @daml/react hooks — every useQuery, useStreamQueries, useFetchByKey, useParty, useLedger equivalent must exist in both libraries.
- *Type Safety:* 100% end-to-end TypeScript safety from Daml template to framework-specific binding, verified with strict: true.
- *Framework Idioms:* Libraries must follow each framework's established patterns (Svelte stores, Vue composables) — not be thin wrappers around React patterns.
- *SSR Support:* Successful server-side contract fetching in SvelteKit and Nuxt 3.
- *Streaming:* Real-time contract updates via WebSocket with automatic reconnection.
- *Open Source:* All packages released under Apache 2.0 license with comprehensive documentation.
- Documentation and knowledge transfer provided.

---

## Funding

*Total Funding Request:* 350,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Core + Svelte): 140,000 CC upon committee acceptance
- Milestone 2 (Vue): 120,000 CC upon committee acceptance
- Milestone 3 (Advanced Features & CLI): 90,000 CC upon final release and acceptance

### Volatility Stipulation

If the project duration is *under 6 months*:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- A launch announcement: "Canton Goes Multi-Framework — Introducing @daml/svelte & @daml/vue"
- A technical blog post demonstrating building a dApp with each framework.
- Video walkthroughs: "From Zero to Canton dApp in Svelte" and "From Zero to Canton dApp in Vue."
- Community engagement through Daml Discourse, npm registry, Svelte Society, and Vue.js community channels.
- Joint presentation at a Canton ecosystem event or webinar.

---

## Motivation

### The Framework Diversity Imperative

A blockchain ecosystem's growth is directly proportional to the number of developers who can build on it. Currently, *Canton's frontend SDK only supports React*, leaving out significant developer populations:

1. *Vue.js* is the dominant framework in *enterprise Asia-Pacific markets* and has strong adoption in financial services — Canton's primary target vertical.
2. *Svelte* is the fastest-growing framework by developer satisfaction (Stack Overflow 2024/2025 surveys) and is increasingly adopted by *fintech startups* building lightweight, high-performance UIs.
3. *Framework lock-in is a turnoff:* Teams with existing Vue or Svelte codebases face a binary choice — rewrite their frontend in React or manually wire @daml/ledger. Both options add months of integration work.

### Community Evidence

The Daml community has repeatedly raised the need for non-React support:

- Developers on Daml Discourse have asked about Vue integration, with the only answer being "use @daml/ledger directly."
- The official documentation explicitly acknowledges that "you can use any framework" but provides zero guidance, examples, or tooling for non-React frameworks.
- Community examples (e.g., o_beer Vue demo) are proof-of-concept quality and unmaintained.

By providing official-quality Svelte and Vue libraries, Canton becomes *the first institutional blockchain to offer first-class support for the three most popular frontend frameworks*.
