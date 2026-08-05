# Development Fund Proposal: Security Audit Procurement for Canton's Q4 2026 / Q1 2027 Audit Programme

**Author:** Eamonn (Founder, Procur3) (info@procur3.io)
**Status:** submitted
**Created:** 2026-07-28
**Champion:** _[Tech & Ops Committee member organisation — to confirm]_
**Website:** https://procur3.io
**Twitter:** https://x.com/procur3
**Related:** https://github.com/canton-foundation/canton-dev-fund/pull/410

---

## Abstract

Digital Asset's core-components security programme (PR #410) puts 11 third-party audits out to RFQ across EOY 2026 / Q1 2027, with up to ~350,000 CC budgeted per audit. This proposal offers Procur3 as the procurement layer to run that RFQ process: post each component as an RFP, keep Digital Asset's incumbent auditors exactly as they are, and where useful open each requirement to additional specialist firms for competitive quotes.

The core argument is simple: the 11 components are not one kind of audit. They span at least five distinct security disciplines — cryptography, distributed-consensus protocol, language runtime, public-API attack surface, and cloud/Kubernetes hardening. No single firm is elite at all five. Procur3 matches each component to firms that genuinely specialise in it, from a vetted network that already includes the auditors trusted for Canton-grade work.

This requires zero funding from the Foundation. Procur3 is free to use, with free multi-user access for the team. Procur3 earns a commission only on a deal awarded to a firm the Foundation was not already engaged with — so onboarding incumbent auditors is seamless and carries no fee. Setup is a single 30-minute session; the team runs everything itself thereafter, with white-glove support throughout. This is the same model Procur3 currently runs for the Midnight Foundation (7 live audit RFPs).

---

## Motivation

Sourcing 11 audits across two quarters is real coordination work: writing each RFP, reaching the right firms, collecting and comparing quotes, checking availability and fit, and tracking each engagement to completion — repeated per component, with comparison across firms done manually.

The harder problem is specialisation.

A firm that is world-class at BFT consensus is not the firm you want hardening a Kubernetes deployment, and a smart-contract auditor is not automatically equipped to review a bytecode interpreter or a cryptographic key-management API. Sourcing all 11 to a small set of firms means potentially either compromising on fit or paying a generalist to stretch outside its strength.

Procur3 turns this into a matched, competitive process. Each component is posted as an RFP; incumbents respond as they always would; and for any component where the Foundation wants competitive tension or a specialist it does not currently work with, the same RFP opens to additional vetted firms with the right discipline. The Foundation keeps full control of who it engages and what it awards, and never loses its existing relationships.

Procur3 is trusted by leading security audit firms like Quantstamp, Zellic, Halborn, Consensys Diligence, Nethermind, Sigma Prime, Hacken, Ottersec and 60 more.

---

## What Procur3 Provides

- **RFP posting per component.** Post each of the 11 audits as a structured RFP with scope, codebase details, timeline, and Daml/Canton-specific requirements. Each RFP can be gated by NDA's and invite-only rounds, ensuring only selected firms have eyes on your code. Firms respond with scoped, comparable quotes.
- **Incumbent suppliers onboarded seamlessly.** The Foundation's existing audit firms are brought onto the platform as-is. They quote and win directly, with no commission on those awards. Nothing about existing relationships changes except that they now sit in one managed flow.
- **Expanded talent pool on demand.** For any audit where the Foundation wants competitive quotes or a specialist capability, the same RFP opens to Procur3's vetted firm network for additional quotes — without the Foundation chasing firms individually.
- **Multi-user team access, free of charge.** The Foundation's security, core contributors, and ops team members get their own access at no cost, so the programme is run collaboratively rather than through one inbox.
- **Vendor due diligence.** Every firm on the platform is vetted; the Foundation can compare track record, specialisation, and Canton/Daml experience side by side rather than selecting blind.
- **Security hub.** In addition to procurement, team's can leverage Procur3's platform for audit report storage and centralisation, security posture maps and more features tbd.
- **Savings.** Procur3 has repeatedly demonstrated security spend savings of up to 40% for each RFP listed on the platform. The auditors using our platform have been submitting proposals for over one year, and are very familiar with the standardised process.
- **White-glove onboarding and support.** Procur3 handles setup directly. Onboarding takes a single 30-minute session with the founder; the Foundation's team then runs the programme independently, with support on hand throughout.

---

## Commercial Terms

- **Zero funding requested.** This proposal asks the Foundation for no grant and no budget line.
- **Free to use.** Platform access and multi-user seats for the Foundation's team are free.
- **Commission only on net-new firms.** Procur3 earns a commission on a deal **only** when the Foundation awards it to a firm it was **not** already engaged with — i.e. a firm Procur3 introduced. Awards to incumbent suppliers carry **no commission**. Commission is collected from successful, net-new audit firms - not the foundation.
- **No lock-in.** The Foundation controls every award decision and handles SOWs, legal and payments off-platform.

The alignment is deliberate: Procur3 is paid only when it expands the Foundation's options and the Foundation acts on that expansion. If the Foundation simply wants a cleaner way to run RFPs with its existing firms, it pays nothing.

---

## Proven With Midnight Foundation

Procur3 is currently running this exact model for the **Midnight Foundation**:

- **7 audit RFPs currently live** on the platform.
- **Incumbent suppliers onboarded** and quoting as-is, with no disruption to existing relationships.
- **Talent pool opened to new vetted firms** for competitive quoting alongside incumbents.

The Midnight engagement demonstrates that the model works for a foundation security team running a real, multi-audit programme — incumbents preserved, options expanded, coordination centralised.

---

## Roadmap Note

Procur3 has a set of features shipping **this quarter** built specifically for foundation security and compliance teams. These are tailored to the exact needs of a team running an ongoing audit and security programme at the Foundation level. We're happy to walk the Foundation through these in detail on a follow-up call.

---

## Onboarding

1. **30-minute session** with Eamonn (founder) to set up the Foundation's workspace, users, and first RFP.
2. **Incumbent firms added** to the workspace so existing suppliers are ready to quote immediately.
3. **Foundation runs the programme** — posting the remaining audits, inviting quotes, and awarding — with Procur3 support on hand.

No integration work, no procurement overhead, no funding, no disruption to existing suppliers.

---

## Why Procur3

Procur3 operates a Web3 security procurement platform connecting protocols with **70+ vetted security firms across 25 ecosystems and 14 security-related services**. To date Procur3 has hosted 100+ RFPs, sourced millions of dollars in proposals, and delivered hundreds of thousands of dollars in savings for teams. Procur3 is already working with the Alliance (accelerator), Canton Foundation's BD team, running the audit-procurement model live for the Midnight Foundation and it's ecosystem, is supporting live teams building on Canton (including Mystic Finance and TermMax) and has supported 100 other teams across Ethereum, Base, Solana, Ton and BNB chain.

---

## Team

| Name | Role | Background |
|------|------|------------|
| Eamonn | Founder, Procur3 | Built the Procur3 Web3 security marketplace; has supported 100+ protocol teams across 25 ecosystems to search, compare, and procure security audits, saving teams over $250,000 in security spend. Previously VP Sales at three Web3 security audit firms and one RegTech SaaS (acquired), with over a decade of GTM and consulting experience. |

---

*Procur3 — Web3 Security procurement*
*procur3.io · X: @procur3 · info@procur3.io*
