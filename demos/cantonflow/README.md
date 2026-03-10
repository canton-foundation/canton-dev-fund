# CantonFlow — Demo Materials

This directory contains demonstration materials for the CantonFlow Visual BPMN Builder proposal. These materials support the [Development Fund proposal](../../proposals/cantonflow-visual-builder.md) and provide reference implementations for each milestone.

## What is CantonFlow?

CantonFlow is a **Decentralized BPMN Engine** — a visual builder where business analysts design workflows in the global BPMN 2.0 standard, while the execution layer is secured by Daml's privacy-preserving ledger on Canton.

It bridges the gap between enterprise process design (BPMN) and decentralized execution (Daml) through:

1. **Visual BPMN Builder** — Camunda-compatible modeler with Canton-native properties (Signatories, Controllers, Observers)
2. **BPMN-to-Daml Transpiler** — 4-stage compiler (Parse → Normalize → Validate → Generate) following CBP-v1 canonical mapping rules
3. **Vibe Coding Agent** — LLM-powered natural language to BPMN + Daml generation with policy-driven validation
4. **Live Canton Cockpit** — Active contract visualization as tokens on the BPMN canvas via Ledger API

## Directory Structure

```
cantonflow/
├── sample-workflows/          # 4 reference workflows with permission gating
│   ├── README.md              # Overview + permission model explanation
│   ├── trade-finance.md       # Letter of Credit (Buyer ↔ Bank)
│   ├── supply-chain.md        # Purchase Order to Payment (Manufacturer ↔ Supplier)
│   ├── insurance-claim.md     # Claims Processing (Claimant ↔ Insurer)
│   └── kyc-onboarding.md      # Identity Verification (Client ↔ Compliance)
├── environment-targets/       # Alternative deployment environments
│   └── README.md              # Daml vs Camunda vs Cloudflare vs Chainlink comparison
└── demo-scripts/              # Presentation materials
    └── README.md              # Demo plan, talk track, variants
```

## Milestone Alignment

| Demo Material | Milestone | Purpose |
|---------------|-----------|---------|
| Sample Workflows | M1 (Modeler) + M2 (Transpiler) | Validates CBP-v1 mapping rules with real-world permission models |
| Environment Targets | M2 (Transpiler) | Demonstrates multi-target compilation pipeline |
| Demo Scripts | M4 (Documentation) | Workshop and presentation materials |

## Working Prototype

A working prototype is deployed at [canton-canvas.primelayer.workers.dev](https://canton-canvas.primelayer.workers.dev) demonstrating:

- Visual BPMN modeler with Canton properties panel
- AI workflow generation (natural language → BPMN diagram)
- Multi-target compilation (Daml, Camunda, Cloudflare Workers, Chainlink CRE)
- CBP-v1 real-time validation
- 4 sample workflows with pre-configured Canton metadata

Source: [github.com/stratoslab/canton-canvas](https://github.com/stratoslab/canton-canvas)
