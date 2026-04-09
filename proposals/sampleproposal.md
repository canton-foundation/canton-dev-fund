# Proposal: Canton DevNet Validator Nodes for External Developers

## Champion
TBD

## Summary

This proposal establishes a set of shared DevNet validator nodes operated by the Canton Foundation, providing external developers with API access for building and testing Canton applications without running their own infrastructure.

## Team

| Name | Role | Background |
|------|------|------------|
| Jatin Pandya | Project Lead | DevRel Manager, Canton Foundation.|
| DevOps Engineer (TBH) | Infrastructure | To be hired — node deployment, monitoring, upgrades |

## Problem

Developers building on Canton currently need to run their own validator node to test against a live network. This creates a significant barrier for hackathon participants, new developers, and small teams exploring Canton. ETHDenver 2026 demonstrated this, builders spent hours debugging SSH access and validator container health instead of writing applications.

## Technical Approach

Deploy 4 validator nodes across DevNet with:
- API gateway providing rate-limited Ledger API and JSON API access
- Per-developer API keys for usage tracking
- Automated node upgrades tracking DevNet releases
- Monitoring and alerting for node health

Applications connect via standard Ledger API — no custom SDKs or wrappers needed.

## Milestones

### Milestone 1: Infrastructure Setup (Weeks 1-4)
- Deploy 4 validator nodes on cloud infrastructure
- Configure API gateway with key management
- Set up monitoring, alerting, and runbooks
- Onboard 2 pilot developer teams

**Acceptance Criteria:**
- All 4 nodes operational and connected to DevNet Global Synchronizer
- API gateway serving requests with <200ms p95 latency
- Pilot teams confirm successful Ledger API connectivity
- Public status page showing node health

**Funding:** 90,000 CC ($13,500)

### Milestone 2: 12-Month Operation (Months 2-13)
- Ongoing node operation and maintenance
- Track DevNet releases and apply upgrades within 48 hours
- Developer onboarding and key distribution
- Quarterly utilization reports to committee

**Acceptance Criteria:**
- 99.5% uptime measured by external monitoring
- Node versions within 1 release of current DevNet
- Quarterly reports published with usage metrics
- Minimum 10 active developer teams using the service by Month 6

**Funding:** 190,000 CC ($28,500)

## GTM / Adoption Plan

- Announce at Canton developer channels and Discord
- Distribute API keys at hackathons (starting with next IRL event)
- Integrate with Canton MCP server for seamless onboarding
- Partner with DPM templates to include DevNet connection configs

## Maintenance Plan

Infrastructure costs covered by 12-month operations milestone. Post-grant sustainability options:
1. Foundation absorbs as core infrastructure if utilization justifies it
2. Submit renewal proposal with updated usage data
3. Transition to validator partner if demand exceeds Foundation capacity