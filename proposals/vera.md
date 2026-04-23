## Development Fund Proposal

**Author:** Unlockit (luis.marado@unlockit.io)
**Status:** Submitted  
**Created:** 2026-03-31

---

## Abstract

This proposal delivers a bounded trust-anchor and verifiable-credential integration layer for Canton. It focuses on the practical problem of making credential-backed trust decisions reusable in Canton applications, with DID recording on Canton, credential issuance managed through a Canton VC application, off-chain presentation handling and verification, and Canton-side trust consumption. Many institution-facing Canton applications need participants to prove qualifications, permissions, delegated authority, or regulated status before they can join a workflow, receive an offer, hold an asset, or trigger a downstream action. Today, teams building on Canton must usually assemble DID handling, credential verification, and application-level trust policy logic on their own.

The proposed output is a reference implementation that makes this architecture concrete. A minimal Canton-backed DID method would provide resolvable public identifiers and DID document state, while agent or wallet software would record DIDs on Canton, issue credentials through a dedicated Canton VC application, prepare presentations off-ledger, and trigger off-ledger verification against Canton-resolved DID state. Canton business applications would then consume reduced verification outcomes and trust-policy results rather than trying to execute VC cryptography directly in Daml. The primary proving flow is a credential-backed transfer authorization case in which a token holder, whether holding stablecoins, stocks, or another tokenized asset, must prove transfer eligibility before a transfer can proceed. The first release does not attempt to build a full SSI platform, wallet stack, or universal interoperability layer. It focuses on the narrower and more useful problem of making credential-backed trust decisions reusable in Canton-based applications.

Commercially, this should reduce the cost, time, and implementation risk of bringing trust-sensitive Canton applications to market by turning repeated DID, verification, and policy-integration work into reusable infrastructure for regulated and audit-sensitive application flows.

---

## Specification

### 1. Objective

Deliver a reusable reference implementation for trust anchors, off-chain credential verification, and policy-aware trust integration on Canton so developers can use credential-backed participation and eligibility rules without rebuilding identity and trust glue from scratch.

The first release should cover a narrow but meaningful class of trust-sensitive application problems:

- creation and resolution of a minimal `did:canton` method for public DID document state
- DID recording flows for issuers and holders through agent or wallet software
- registrar and resolver support through a standards-aligned external identity-agent integration layer
- credential issuance managed through a Canton VC application, with off-chain presentation creation and verification using that DID support where relevant
- reusable Canton-facing verification outcomes and policy hooks that influence application participation, eligibility, or downstream action
- explicit evidence-boundary rules for what remains off-ledger versus what is represented in Canton application state

For the purposes of this proposal, a credential-backed participation problem is any application flow where one party must prove a claim issued or endorsed by another party before it can access a role, join a process, satisfy a compliance gate, or trigger a business action.

This work is most immediately useful to Canton teams building applications that rely on decentralized identity and verifiable credentials to address recurring trust problems such as issuer recognition, credential-backed eligibility, delegated onboarding, portable attestations, and proof-driven access control across organizational boundaries. The intent is to make identity-aware application behavior easier to carry across products instead of forcing each team to rebuild DID handling, verifier logic, and policy integration independently.

### 2. Implementation Mechanics

The project will produce an open reference implementation composed of:

- a bounded `did:canton` method draft and DID document model
- Canton-backed registry contracts for DID recording and registry interaction within the documented scope
- a Canton VC application flow for credential offer, acceptance or rejection, and credential delivery
- a resolver and registrar integration for one standards-aligned external identity-agent framework
- a trust and verification layer that exposes reusable verification outcomes to Canton applications
- example application flows showing how credential verification affects eligibility or participation
- Daml packages, APIs, documentation, and an extension guide for future ecosystem use

The work is intentionally focused on making decentralized identity and verifiable credentials usable in Canton applications rather than on building a complete identity stack. Wallet UX, richer issuer portals, universal DID method support, and full credential exchange ecosystems can sit around this layer rather than being bundled into it.

The first release should be evaluated as a bounded proof that Canton can host a minimal public DID layer while external agent tooling handles the cryptographic work that Daml does not currently support. Its purpose is to show that one reusable architecture can connect Canton-backed DID resolution, off-chain credential presentation and verification, and Canton-side policy-aware application behavior without every team rebuilding the bridge independently. Broader SSI infrastructure, generalized wallet ecosystems, and native on-ledger VC presentation verification remain outside the scope of this first release.

Existing DID methods such as `did:web` or `did:key` can still be used where appropriate, and the proposal does not attempt to displace them. The value of a minimal `did:canton` is narrower: it provides a Canton-native trust-anchor option where identifier lifecycle, update control, and application-facing trust integration need to live closer to the Canton environment rather than being treated as a completely external concern.

A credible first implementation path is to define a bounded core around five reusable concepts:

- **DID registry model:** public DID document state and other key aspects for a minimal `did:canton`
- **Credential issuance application:** a Canton VC application that handles credential offer, acceptance or rejection, and delivery coordination
- **Resolver and registrar integration:** external agent interfaces that create and resolve `did:canton` documents through one practical integration surface
- **Verification outcome model:** normalized pass, fail, stale, or unsupported outcomes that Canton application logic can consume
- **Evidence boundary and policy hooks:** explicit rules for what credential material stays off-ledger and how verification outcomes allow, deny, defer, or qualify application behavior

This shared structure becomes the first reusable trust layer for Canton applications that need more than ledger membership alone.

#### Core Layer: Minimal `did:canton`

The DID layer captures the minimum public identifier support needed for the rest of the architecture.

**DID registry model**  
The first release should define a bounded `did:canton` method with a clear identifier format, DID document model, and resolution semantics. The DID document scope should remain limited to the elements required for off-ledger verification in the chosen integration path, with verification methods as the core required capability. 

Because this is a Canton-backed DID method rather than a purely external reference scheme, the operating model also needs to be explicit. The parties responsible for maintaining the DID document state on-ledger would also be the natural candidates to run the method-facing resolver infrastructure needed to serve or expose that state to external agent tooling. This authority surface, including who participates in maintaining the DID state and who has visibility into DID-related templates, is an important design consideration and should be made explicit in the architectural model rather than being left implicit. Canton mechanisms such as explicit contract disclosure can help structure that visibility boundary among the responsible parties without assuming universal on-ledger visibility by default. In a later evolution, that governance surface could align naturally with broader allocation and governance primitives such as those proposed in CAP, but that broader treatment is outside the first release.

**Resolver and registrar integration**  
The first release should provide one practical integration path for creating and resolving `did:canton` identifiers through a standards-aligned external identity-agent framework. It should reuse the resolver and registrar model already established in modern decentralized identity tooling rather than inventing a Canton-specific agent model from scratch. This is enough to make the DID method usable in real credential flows without promising broad ecosystem support from day one.

#### Core Layer: Canton VC Application

The first release should also define a bounded Canton VC application for the credential-management path that sits between agent software and later business applications.

**Credential issuance handling**  
The Canton VC application should handle credential offer submission, holder acceptance or rejection, and the Canton-side coordination needed before the credential is finally delivered to the holder's agent or wallet. This keeps credential-management behavior distinct from later business applications that consume verification outcomes.

#### Core Layer: Off-Chain Credential Verification

The cryptographic lifecycle stays off-chain in the first release.

**Issuance and presentation handling**  
Credentials should be offered and coordinated through the Canton VC application, then held and presented through external agent or wallet tooling. A `did:canton` identifier may be used as issuer or participant identity where relevant, but Canton is not responsible for creating presentations inside Daml.

**Verification outcome model**  
The result of verification should not be raw credential data copied into application state. It should be a normalized trust result, together with enough metadata to make the outcome auditable and explainable.

**Evidence boundary and policy hooks**  
Applications need a clean rule for what credential material remains off-ledger and what reduced trust result is represented on-ledger. The first release should provide reusable hooks for policy-aware participation and eligibility checks rather than forcing one-off verifier glue into every application. In the intended model, a verifier agent or wallet connects to Canton, submits or receives the presentation-related messages, resolves DID state from the Canton registry, and coordinates off-ledger verification before returning the outcome to the business application.

Credential status, revocation handling, and richer lifecycle support are important follow-on concerns, but they remain outside the first-release boundary and should be treated as later evolution rather than silently assumed in phase 1.

#### Example Integration Patterns

The first proving patterns should be application-facing and easy to evaluate:

- **Credential-backed transfer authorization**, as the primary proving flow, where a token holder of stablecoins, stocks, or another tokenized asset can transfer to another party only after presenting a verifiable credential that satisfies the relevant transfer-eligibility policy
- **Credential-backed offer or participation eligibility**, as the secondary proving flow, where a participant proves that a verified affordability, qualification, or similar credential satisfies the threshold needed to proceed in a business workflow

The first pattern is the main ecosystem-facing proof case. The second shows that the same trust layer also supports institution-facing participation and approval workflows beyond transfer gating.

#### Architectural Notes

The proposal should remain grounded in Canton’s native strengths:

- privacy-aware multi-party state
- explicit authorization and participant visibility
- deterministic application logic over shared state
- auditable contract state and policy outcomes

The implementation should support credential-backed trust decisions without assuming that all credential material must be stored on-ledger, even if Canton can safely host private state where appropriate. It should also avoid pretending that Canton itself becomes a complete decentralized identity network. The point is to make DID-backed trust resolution and off-chain credential verification usable inside Canton applications in a reusable and well-bounded way.

A credible future direction after the first release is to investigate how much of the verification path can move on-ledger, but that is explicitly outside the first release because Daml does not currently expose the cryptographic primitives needed for native VC presentation handling and verification.

#### Illustrative Diagrams

The first diagram shows the shared trust setup: DID recording for issuer and holder, followed by credential issuance through the Canton VC application. The later business-flow diagrams assume this setup is already in place.

![DID recording and credential issuance](diagrams/diagram-did-recording-and-credential-issuance.svg)

The second diagram shows the primary proving flow: credential-backed transfer authorization.

![Transfer eligibility flow](diagrams/diagram-transfer-eligibility.svg)

The third diagram shows the secondary proving flow: credential-backed offer or participation eligibility.

![Offer eligibility flow](diagrams/diagram-offer-eligibility.svg)

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture and ecosystem priorities because it builds on:

- privacy-aware application state
- explicit authorization and policy-sensitive participation
- application-layer reference implementations reusable across domains
- public trust anchors and off-ledger verification working together rather than being collapsed into one stack

It also fits the Development Fund focus on shared developer tooling, reference implementations, and common-good infrastructure rather than one-off integration work for a single application.

### 4. Backward Compatibility

No protocol-level backward compatibility impact is expected. The proposed work is an application-layer reference implementation and support layer. Existing Canton applications and protocol behavior remain unchanged.

---

## Milestones and Deliverables

### Milestone 1: DID Method, Trust Model, Registry Build Underway
- **Estimated Delivery:** Weeks 1-6  
- **Focus:** Define the bounded `did:canton` method and build the first runnable DID registry through Canton-backed registry contracts  
- **Deliverables / Value Metrics:**  
  - did:canton method and trust model specification
  - first-release scope and out-of-scope decision note
  - Canton-backed DID registry contracts for issuer and holder DIDs

### Milestone 2: Resolver, Registrar, And VC Application Layer
- **Estimated Delivery:** Weeks 7-12  
- **Focus:** Build the first runnable DID integration and Canton VC application flow  
- **Deliverables / Value Metrics:**  
  - working did:canton resolver 
  - working did:canton registrar 
  - working Canton VC application flow

### Milestone 3: Off-Chain Verification And Canton Application Integration
- **Estimated Delivery:** Weeks 13-18  
- **Focus:** Prove that off-chain credential verification can drive Canton business-application behavior through the delivered trust layer  
- **Deliverables / Value Metrics:**  
  - off-chain presentation and verification path integrated with the DID layer and Canton VC application
  - end-to-end transfer-authorization demo using the delivered trust layer
  - end-to-end offer or participation-eligibility demo using the delivered trust layer

### Milestone 4: Example Flows, Hardening, And Release
- **Estimated Delivery:** Weeks 19-24  
- **Focus:** Use reference flows to prove reuse, harden the trust layer, and package the release for other teams  
- **Deliverables / Value Metrics:**  
  - reference repository for the two end-to-end example flows
  - integration guide and setup instructions for external Canton teams
  - hardened runtime APIs and policy interfaces based on the example flows
  - runnable walkthroughs and public release package ready for ecosystem evaluation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- a working reusable DID and trust reference implementation
- at least two reproducible example flows
- documentation sufficient for another team to understand and evaluate adoption
- clear evidence that the output is reusable ecosystem infrastructure rather than a one-off application integration

Project-specific acceptance conditions:

- the output must clearly distinguish what is standardized, what is an architectural choice, and what remains intentionally deferred
- the `did:canton` method boundary and supported operations must be documented explicitly
- one end-to-end credential-backed transfer-authorization flow must be demonstrated
- one end-to-end credential-backed offer or participation-eligibility flow must be demonstrated
- verification outcomes must be shown influencing application participation, eligibility, or downstream trust-aware flow behavior
- the implementation must clearly document the evidence boundary between off-ledger credential material and on-ledger application state
- the implementation must clearly document what the first release covers and what remains outside the supported boundary

---

## Funding

**Total Funding Request:** 550,000 CC  

The requested funding is intentionally scoped to a bounded reference-implementation effort rather than a full decentralized identity stack build. It is meant to cover the design, implementation, validation, and publication of a minimal Canton DID method, one practical resolver and registrar integration path, an off-chain verification bridge, example flows, and the documentation needed for ecosystem evaluation and reuse. It does not assume delivery of wallet infrastructure, universal DID method support, issuer products, or complete on-ledger credential verification.

### Payment Breakdown by Milestone
- Milestone 1 _(DID Method, Trust Model, Registry Build Underway)_: 150,000 CC upon committee acceptance
- Milestone 2 _(Resolver, Registrar, And VC Application Layer)_: 150,000 CC upon committee acceptance
- Milestone 3 _(Off-Chain Verification And Canton Application Integration)_: 150,000 CC upon committee acceptance
- Milestone 4 _(Example Flows, Hardening, And Release)_: 100,000 CC upon final release and acceptance

### Timeline Accountability
If a milestone is delayed beyond its stated delivery month for reasons under the proposer’s control, the payout for that milestone should be reduced by **5% for each additional 2-week delay**, capped at **20%** for that milestone.

Delays caused by Committee-requested scope changes, dependency changes imposed by the Canton ecosystem, or other agreed external blockers should not trigger this penalty automatically and should instead be handled through explicit milestone re-planning.

### Volatility Stipulation
The planned project duration is **6 months**. On that basis, no additional volatility adjustment is assumed in this proposal.

If the project timeline extends materially beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for significant price volatility.

Unlockit is already exploring these topics through ongoing academic partnerships and expects that work to continue regardless of the fund outcome. The requested funding matters because it would accelerate delivery beyond the pace of an academic exploration track and turn that work into a public, reusable reference implementation on a materially shorter timeline.

---

## Co-Marketing

Upon release, the implementing entity will work with the Foundation on more than simple visibility for the project. The aim is to move the delivered implementation toward serious technical evaluation and practical reuse.

The released trust layer should be easy to find, straightforward to assess, and practical to test for teams that may want to adopt, extend, or build on it. That requires clear positioning within the Canton stack, examples and documentation packaged for real evaluation, and coordination with early evaluator teams so external groups can move from interest to technical assessment with limited friction.

Accordingly, the implementing entity will collaborate with the Foundation on:

- a coordinated public announcement covering the problem, delivered artifacts, and intended ecosystem value
- a technical architecture write-up explaining the DID method boundary, resolver and registrar model, evidence-handling approach, and key design tradeoffs
- at least one recorded developer walkthrough showing how credential verification outcomes can be integrated into an example Canton application flow
- publication of the example flows and reference integration material in a form that other teams can clone, run, and evaluate
- a live ecosystem demo or workshop session focused on adoption, implementation constraints, and extension paths for teams building trust-sensitive Canton applications
- coordination with the Foundation to identify and engage early evaluator teams who can test the delivered implementation in relevant credential-aware use cases
- active dissemination through relevant academic, research, and professional networks to increase awareness of both the engineering output and the underlying DID-and-verification integration problem

---

## Motivation

Canton is well suited to applications where multiple parties must coordinate under explicit authorization and privacy boundaries, but many of those applications also require trust inputs that come from outside the ledger itself. A participant may need to prove qualifications, permissions, regulated status, or selected facts before being allowed to join a process, receive an offer, or trigger a downstream action. Today, Canton applications that need this capability still tend to assemble DID handling, credential verification, and policy-aware trust logic on a project-by-project basis.

Canton is also at a point where the underlying privacy and coordination primitives are already strong, but the identity and trust baseline is still missing. Closing that gap would shorten the path from architecture to working implementation for trust-sensitive use cases and make Canton easier to recognize as a platform for policy-aware coordination as well as asset and contract representation. This matters most in institution-facing settings where eligibility, delegated onboarding, transfer permissions, and approval rights depend on externally issued evidence rather than on ledger membership alone.

The broader DID and VC ecosystem has already developed many of the conceptual ingredients for this problem, including DID resolution, issuer-holder-verifier models, credential presentation, and portable trust assertions. But Canton does not natively expose those primitives as reusable application building blocks. Daml can represent application state, including private state where appropriate, but it cannot natively create or verify VC presentations because the required cryptographic primitives are not available inside the language. That creates a practical gap: the ecosystem needs a reusable architecture in which DID-backed trust state is available to Canton applications while cryptographic presentation handling remains off-chain.

This is also not a Canton-only problem. The broader decentralized ecosystem already treats eligibility and permissioning as recurring application concerns. The [W3C Verifiable Credentials Use Cases](https://www.w3.org/TR/vc-use-cases/) note spans finance, retail, healthcare, and professional credentials, and other decentralized ecosystems have also had to introduce identity-aware and eligibility-aware transfer or participation controls in practice. Canton feels no different in that respect. It still needs a reusable pattern for handling the same class of trust and eligibility problems in a privacy-aware multi-party application environment rather than leaving them as one-off integration glue in each project.

Unlockit is approaching this from product work where trust-sensitive progression depends on verifiable evidence rather than on ledger membership alone. Transfer eligibility checks, delegated onboarding, offer-eligibility decisions, and other proof-backed business actions all expose the same need: applications must be able to consume trust results in a reusable way without forcing every team to build a custom verifier sidecar, custom DID handling, and custom policy model.

Any academic continuation is outside the grant objective. The grant is for reusable engineering output: a working trust layer, working integration paths, and usable example flows that other Canton teams can adopt.

---

## Rationale

The proposal backs a concrete and reusable trust-anchor and verification layer rather than a generic identity-platform pitch. It is scoped to the narrower and more useful problem of making DID-backed trust resolution and credential verification reusable in Canton-based applications.

The economic case is strongest when this is treated as one focused reference implementation rather than as a broad SSI platform build. Putting effort into a minimal DID method, resolver and registrar integration, off-chain verification outcomes, policy-aware participation hooks, and reusable example flows is a better ecosystem investment than letting each team rebuild identity and trust handling independently.

There is also a sound business rationale behind this proposal. Unlockit expects this kind of support layer to enable future product features in settings where workflow participation, regulated access, delegated authority, or business approval depends on verifiable external claims. At the same time, the problem is too horizontal to justify solving only as proprietary application glue for one product line.

The primary proving case is also well matched to Canton’s current ecosystem, because tokenized assets and transfer-sensitive application flows make credential-backed transfer authorization easier to evaluate than a more generic identity demo. It ties the proposal directly to a concrete Canton problem: how to let institution-facing applications consume externally verified trust inputs without inventing a new trust stack for each project.

The Development Fund fits this work because Unlockit is prepared to initiate it while the intended output extends beyond Unlockit itself. The desired result is a reusable DID and trust layer that other teams can adopt, extend, and evaluate in domains beyond Unlockit’s immediate priorities. If the initial implementation demonstrates value, it should establish a foundation for further contributions, additional trust-sensitive application patterns, and future implementations beyond the originating use cases.

The proposal is also strongly aligned with the Development Fund because:

- it creates reusable trust infrastructure for the ecosystem
- it lowers implementation cost for future teams building trust-sensitive applications
- it is open and reusable
- it strengthens Canton’s story in a category where privacy, authorization, public trust anchors, and verifiable off-ledger evidence need to work together
- it addresses a coordination problem that appears across multiple domains rather than only one vertical

The main design choice is to fund a focused reference implementation instead of a full decentralized identity platform. That keeps scope realistic while still producing something that the ecosystem can use and build on. It also leaves room for adjacent efforts in wallets, issuer services, broader interoperability tooling, and later privacy-preserving proof systems to complement the trust layer rather than being forced into the same grant.
