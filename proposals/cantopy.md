# Cantopy: Yield Optimization Layer for Canton Network

## Summary

Cantopy is a yield optimizer built natively on Canton Network. It automatically routes tokenized assets to the highest-yielding protocol on Canton, rebalancing when better opportunities appear. The on-chain delegation model uses Daml contracts so users sign explicit authorization limits before any automated action can take place.

We are requesting funding to complete DevNet integration, connect to live protocol rate feeds, integrate wallet connect with a Canton-native wallet, and produce open reference documentation of the delegation-based automation patterns we have built, so other Canton builders can reuse them.

---

## Objective and Scope

**Problem**

As tokenized assets arrive on Canton from DTCC, Broadridge and others, they will increasingly sit idle unless there is yield infrastructure to put them to work. Today there is no automated routing layer on Canton that moves assets between yield sources based on live rate data. Users holding Canton Coin, tokenized treasuries, or stablecoins on Canton must manually monitor rates and manually move their assets, or accept whatever yield a single protocol offers.

**What Cantopy does**

Cantopy monitors yield rates across Canton protocols in real time. When a better rate appears, it either proposes a rebalance for the user to approve, or executes automatically within the limits the user has defined on-chain. The user never loses control and Cantopy never holds assets.

**Scope of this proposal**

This proposal covers the work required to move from a working LocalNet product to a live DevNet deployment with real protocol integrations and open documentation for the ecosystem.

---

## Technical Approach

**What is already built**

The following is live and functional on LocalNet:

- Daml smart contracts: VaultRequest, Vault, YieldPosition, RebalanceRequest, VaultAuthorization, VaultAuthorizationProposal
- Java/Spring Boot backend with a rebalance engine that scans active positions every 60 seconds
- React frontend with vault management, position tracking, auto-approve settings, and an on-chain audit log
- VaultAuthorization delegation pattern: provider proposes limits, user signs on-chain, Cantopy respects those limits in all automated actions
- Vault_ClosePosition atomic choice that updates vault totals when positions are closed or rebalanced
- Auto-approve config persistence across backend restarts
- Circuit breakers on rate data (rejects changes above 50%) and rebalance frequency (5 minute cooldown per position)
- Stale rebalance request cleanup on startup
- Marketing page at cantopy.finance with working waitlist

**Work remaining for DevNet**

1. DevNet participant node setup and connection to the Global Synchronizer
2. Real rate feed integration for Alpend and Cantex via their DevNet APIs
3. Wallet connect integration with a Canton-native wallet
4. VaultAuthorizationProposal acceptance flow tested end-to-end with real user wallets (this works architecturally but requires real wallet tokens to test)
5. OIDC auth setup replacing shared-secret LocalNet auth
6. Canton-native DEX integration as an additional yield source (LP fee APY vs lending APY routing)

**Architecture**

The delegation pattern is the architectural differentiator. Rather than the provider having blanket authority, the user signs a VaultAuthorization contract that specifies:

- Whether auto-rebalance is enabled
- Minimum improvement threshold before auto-rebalancing
- Maximum amount per rebalance transaction
- Expiry date

The RebalanceEngine checks for an active on-chain VaultAuthorization before executing any automated transaction. If no authorization exists or it has expired, the engine creates a RebalanceRequest for manual approval instead. This is enforced at the Daml contract level, not just at the application level.

**Ecosystem connections**

Cantopy has existing relationships with:
- Alpend: Canton lending protocol (Foundation member), current yield source
- We have established connections with several other Canton ecosystem teams, including a Canton-native wallet currently on DevNet and a Canton-native DEX live on MainNet, with planned integrations for wallet connect and LP yield source routing respectively

---

## Architectural Alignment

Cantopy aligns with Canton's core design in several specific ways.

**Privacy by default**: yield positions and rebalance decisions are visible only to the user and Cantopy. No front-running is possible because rebalance decisions are not broadcast publicly.

**Atomic settlement**: Vault_ClosePosition and Vault_OpenPosition execute as a single atomic transaction. Either the rebalance completes entirely or nothing changes.

**Daml as the trust layer**: the VaultAuthorization contract is the source of truth for what Cantopy is permitted to do. The Java backend cannot exceed what the contract allows. This is enforced by Canton's authorization model, not by application-level checks.

**Reference implementation value**: the delegation pattern we have built is a general pattern applicable to any Canton application that needs to automate actions on behalf of users within defined limits. We will document it fully so other builders can apply it without having to solve the same problems from scratch.

---

## Milestones and Deliverables

**Milestone 1: DevNet deployment and live rate integration**

Deliverables:
- Cantopy participant node connected to Canton DevNet
- Real Alpend and Cantex rate feeds replacing mock data
- End-to-end rebalance flow tested on DevNet with real protocol contracts

Timeline: 4 weeks from DevNet access

**Milestone 2: Wallet connect and user auth**

Deliverables:
- Canton-native wallet connect integrated, replacing shared-secret auth
- VaultAuthorizationProposal accept/reject flow tested with real user wallets
- OIDC auth configured for production use

Timeline: 4 weeks after Milestone 1

**Milestone 3: Canton-native DEX integration**

Deliverables:
- LP fee APY data from a Canton-native DEX integrated into rate engine
- Rebalance engine can compare lending APY against LP fee returns and route accordingly
- LP position type added to Daml contracts

Timeline: 6 weeks after Milestone 2

**Milestone 4: Open documentation**

Deliverables:
- Full technical write-up of the Daml delegation pattern published on the Canton developer forum
- Architecture documentation covering vault lifecycle, rebalance engine design, and the VaultAuthorization trust model
- Open reference implementation published for other Canton builders

Timeline: concurrent with Milestone 3

---

## Acceptance Criteria

Milestone 1 is complete when:
- A live rebalance executes on DevNet between two real protocols
- The rebalance is visible in the on-chain audit log
- Rate data is sourced from real protocol APIs, not mocks

Milestone 2 is complete when:
- A user can connect a Canton-native wallet, open a vault, sign a VaultAuthorization, and have Cantopy auto-rebalance within their defined limits, end to end on DevNet

Milestone 3 is complete when:
- Cantopy can compare Alpend/Cantex lending APY against Canton-native DEX LP returns and route to whichever is higher

Milestone 4 is complete when:
- The delegation pattern documentation is published on forum.canton.network and the reference implementation is publicly accessible

---

## Funding Request

We are requesting funding in Canton Coin to cover development time across the four milestones.

| Milestone | Scope | Funding Request (CC) |
|---|---|---|
| 1: DevNet deployment and live rates | 4 weeks | TBD with committee |
| 2: Wallet connect and user auth | 4 weeks | TBD with committee |
| 3: Canton-native DEX integration | 6 weeks | TBD with committee |
| 4: Open documentation | Concurrent | TBD with committee |

We are open to guidance from the Tech and Ops Committee on appropriate funding levels. Payments should be milestone-based as per the fund's standard terms.

---

## Evidence of Technical Capability

- Working product on LocalNet with full Daml contract suite, Java backend, React frontend
- Daml contracts written from scratch without scaffolding generators
- VaultAuthorization delegation pattern designed and implemented
- Atomic rebalance flow (close position and open new position in single transaction) working
- Marketing page live at cantopy.finance with active waitlist

---

## Long-term Maintenance

Cantopy is intended to operate as a live application on Canton MainNet. Maintenance is self-sustaining through Featured App CC rewards once live on MainNet. The open documentation and reference implementation require no ongoing maintenance once published.

---

## Distribution and Adoption Plan

Initial users will come from:
- Existing waitlist at cantopy.finance
- Canton ecosystem connections via planned wallet and DEX integrations
- Canton developer forum visibility

Longer term, Cantopy's utility grows with the Canton ecosystem. As DTCC tokenizes US Treasuries and more RWAs arrive on Canton, the demand for automated yield routing increases proportionally. Cantopy is positioned to be the default yield layer for Canton assets.

---

## Contact

Martin Backlund  
cantopy.finance  
martin.backlunda@gmail.com  
https://www.linkedin.com/in/martin-a-backlund/  
@Cantopyfi on X  
Available for demo call on request
