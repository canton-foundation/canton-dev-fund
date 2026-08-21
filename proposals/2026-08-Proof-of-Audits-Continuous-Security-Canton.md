# Development Fund Proposal - Proof of Audits for Canton

| Field | Value |
| :---- | :---- |
| Author | MK Veerendra Vamshi - Proof of Audits (solo founder, https://proofofaudits.com) |
| Org | Proof of Audits |
| Champion | Seeking Champion - I would love a Tech & Ops member to champion this (SIG: daml-tooling) |
| SIG | daml-tooling |
| Created | 2026-08-21 |
| Status | Draft for Champion review |

---

Hi Canton team - I am MK, I built Proof of Audits.

**What I built:** I run a contest platform where the report does not die after the audit. We find bugs with contests, then we keep the proof alive - we match the deployed DAR to the reviewed DAR, we check authority controls, we score it /1400, and we show it in a Trust Passport. Anyone can verify before they sign via our free Contract Shield extension.

**Our core is T4->T1.** I do not run a crowd where 10 people check the same lines. I run 4 tiers in sequence:
- **T4** checks functions (edge cases)
- **T3** checks contracts (must first validate T4)
- **T2** checks cross-contract calls (must first validate T3)
- **T1** checks the whole system (must first validate T2)

No duplicate pay, no blind spots. T3 cannot start until T4 is done, and so on. That is our main.

**Why this matters for Canton:**
Canton hides data by default - only the right parties see the right data. That is great for banks, but it also hides the exact risk: in Daml, the bug is not reentrancy, it is "package A quietly exercising a choice of package B and moving money" or a bad signatory. That risk lives in T2 and T1 - the layers most audits skip. Canton has EVM support (Zenith) and a great Daml analyzer (Certora), but no one guarantees T4->T1 was actually covered. I want to build that guarantee for Canton.

**What I will ship for Canton - all at once, not piecemeal:**

I will ship one unified system - CLI + Passport + Shield - built together:

1. **T4-T1 Daml engine:** Give it a `.dar`, it builds the call graph, it checks all 4 tiers in order. T2 specifically lists every place where one package can use another package's template/choice - with file, line, package versions, template/choice name, and whether it consumes. You get JSON you can use in CI plus a visual graph.

2. **Permissioned Trust Passport:** Because banks cannot leak IP, I will make passports permissioned. Public sees a green check and a /1400 score. The full bundle and the interview stay in a private vault - only a KYC'd counterparty you approve can open it. I can also give a ZK attestation: "keys are verified" without revealing who holds them.

3. **Contract Shield for Canton:** My free extension already does this for EVM at proofofaudits.com/verify-contract. I will add Canton - it checks "does the DAR on the validator equal the DAR we reviewed?" and "are the signatories right?" before you sign.

All of this runs on the compiled `.dar` - the same file you deploy. It only reads, it never changes the ledger. It fits right into `daml build` / `dpm` / CI. I will open-source it Apache-2.0.

---

# How I will deliver it - 4 months, milestone-based

**M1 - Build the T4->T1 engine (2 months, 210k CC):**
I will deliver a CLI that runs on Linux/Mac/Windows, takes a `.dar`, runs T4->T3->T2->T1 in order, and blocks T3 if T4 has not passed. T2 will report all 6 fields for every cross-package use. I will docs it and release it Apache-2.0, tested on 2 real Daml projects.

**M2 - Pilot it on real Canton apps (1 month, 105k CC):**
With your intros, I will run it on Splice + 5 voting member apps. I will issue their first permissioned passports and fix what you tell me to fix.

**M3 - Shield + broad adoption (1 month, 105k CC):**
I will ship the Canton Shield extension, verify DAR hash + authority on a live validator, run the engine on 5 more production apps, and publish a CI template + short video.

Total: 420k CC, paid per milestone per CIP-0100 (0.15 USD ref, 30-day MA band 33.3%).

---

# How you can check I delivered

**M1:** You run `prove --dar app.dar` and you get JSON + graph with the 6 fields, and you see T3 blocked until T4 passes. 3 voting members try it and say "yes".

**M2:** Splice + 5 members ran it, got passports, and say they want to keep using it.

**M3:** Shield shows green for a correct DAR and red for a wrong DAR on a validator. 5 more members ran it and endorsed. CI template works.

---

# Why I am asking Canton
You give me milestone funding, I give Canton open infra that makes every future audit provably covered. This fills the gap between Zenith (EVM) and Certora (analyzer) - I give you the guaranteed-coverage model.

I will also write a joint blog on cross-package delegation risk and run a workshop for Canton devs.

**About me:** Solo founder, Top 10 Sherlock, 180+ repos, Cyfrin certified. I live at proofofaudits.com (beta 30 Jul 2026, pre-revenue, 40 auditors scored). I will maintain this for 12 months.

Happy to jump on a 15-min call and adapt this to what SIG daml-tooling needs most.

- MK

License: Proposal CC0-1.0, Code Apache-2.0
