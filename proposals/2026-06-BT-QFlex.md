# Post-Quantum Cryptographic Agility for Canton

**Authors**: Yoon Auh, Nick Bennig, Sotir Triantafillou, Eric Hauk\
**Status**: Draft\
**Created**: 2026-06-26\
**Champions**: IntellectEU, 7Ridge/C7, Texture Capital
## **Abstract**

BOLTS Technologies (BOLTS) requests a Development Fund grant to integrate QFlex, a crypto-agile quantum resilient solution, as a long-term, production-grade infrastructure for Canton Network. This project delivers a common good to Canton by providing QFlex as a shared asset of the ecosystem and a core protocol upgrade. The proposed grant is in 4 sections: (i) development/integration, (ii) adoption, (iii) maintenance, and (iv) licensing.



QFlex helps the Canton ecosystem expand, enhance, and maintain cryptographic agility by enabling rapid remediation of transaction-signing vulnerabilities and supporting long-term quantum resilience. QFlex also includes integrated capabilities for encryption and other cryptographic functions, which may enable additional ecosystem use cases in the future. Further, QFlex enables each Canton actor (dApp, node,  super validator, etc.) to customize their cryptographic protections based on applicable jurisdictional, regulatory, organizational, and risk preferences. The QFlex approach aligns with security design principles for Diversity (Dynamicity) and Defense in Depth, and long-term cyber resiliency across institutional infrastructure as viewed by Dr. Ron Ross, the primary author of NIST SP 800-160 and SP-800-53 and a BOLTS advisor.



This proposal directly results from a successful pilot demonstrating QFlex capabilities on Canton performed between December 2025 to April 2026. The capabilities exhibited during the pilot include:

* Backwards compatibility with and continued access to existing ECC signature pathways
* Each node can make independent choice of legacy or PQC algos for topology orchestration
* Client app onboarding using legacy or PQC algos with or without QFlex API
* Client app hybrid signature methods using legacy or PQC algos with or without QFlex API
* Access to multiple open-source cryptographic libraries via QFlex; the pilot and this proposal emphasize the use of publicly available, trusted, open-source cryptographic libraries.
* Pilot results can be accessed via this link: [https://docsend.com/view/i9r9zxffdj4w9j2w](https://docsend.com/view/i9r9zxffdj4w9j2w)

For the adoption goal, we plan on working closely with IntellectEU in helping them adopt QFlex capabilities in their CatalyX product suite.

QFlex delivers significant value to all Canton actors with unmatched validations from industry visionaries and research organizations.  The timeline of this proposal aims to bring quantum resilience to Canton well before the 2029 Google/Ethereum deadline and the US Executive Order #14409 revising Federal mandates to 2030-2031. 

We believe this proposal furthers Canton’s global coverage positioning and provides industry-leading asset security capabilities on Canton.  Canton-QFlex will set the gold standard for quantum resiliency for tokenized assets globally.

This proposal establishes an evaluation framework covering:

* Development, integration, and release to Canton ecosystem
* Maintenance grant
* Canton-QFlex Source-Available License
* Developer documentation, and ecosystem onboarding
* Assist Ecosystem growth through technical events, workshops, and integration support



## **Specifications**

1. **Objective**

Integrate QFlex into the Canton ecosystem as a production-grade cryptographic agility framework supporting legacy, post-quantum, and hybrid algorithms, with a design that enables engineered evolution as standards and regulatory requirements change.

2. **Implementation**

   1. **Technical Mechanics**

   QFlex will be implemented as an additive cryptographic code path alongside Canton’s existing EdDSA/ECDSA workflows.



   The implementation is organized around three core cryptographic functions: QFlex\_generatekeys(), QFlex\_sign(), and QFlex\_verify(). These functions interface with approved open-source cryptographic libraries to perform key generation, transaction signing, and signature verification across supported legacy, post-quantum, and hybrid algorithms.



   QFlex integrates into Canton through an API architecture for validator, participant-node, and application signing workflows. During transaction creation, any node can invoke the QFlex signing API to generate a supported signature format. For transaction verification, the transaction metadata identifies the cryptographic scheme used so that receiving nodes can validate the transaction through the corresponding verification pathway: QFlex or legacy. Applications can continue to use their own legacy methods and/or construct messages formatted for QFlex processing on the receiving nodes; QFlex API use will be optional for applications.



   QFlex will not replace institutional key management infrastructure.  Existing Key Management Systems (KMS), Hardware Security Modules (HSM), custody platforms, and signing systems remain entirely under operator control. QFlex operates strictly as an orchestration layer, invoking approved cryptographic providers and coordinating supported transaction-signing pathways. In the future, QFlex enhancements can enable Canton to work with PQC HSMs/KMS where applicable.



   Operationally, QFlex is designed to support long-term cryptographic agility without requiring disruptive network-wide upgrades or coordinated cryptographic migrations. As regulatory, jurisdictional, and organizational requirements evolve, QFlex enables participants to adopt and transition cryptographic protections independently while preserving interoperability across the broader network.



1. **Architectural Alignment**

   This proposal’s alignment with Canton is direct and fundamental: quantum resiliency of blockchains is a critical problem for the industry as Elliptic Curve Cryptography (ECC: ECDSA/EdDSA) is at the heart of asset security for most of the industry, and ECC is the asymmetric cryptographic algorithm most vulnerable to a cryptographically relevant quantum computer (CRQC).

   Since its inception in 2016, QFlex has established a proven track record of operational maturity and technical validations including a 2024 NIST SBIR grant, a Canton pilot in early 2026 and supported by a portfolio of more than 37 granted patents. By integrating QFlex as detailed in this proposal, Canton Network actors can effectively insulate their digital assets from quantum threats while elevating Canton’s position as the leader in blockchain crypto-agility.

   Contrary to the industry’s cold starts, BOLTS brings together the leading experts in message-level crypto-agility combining over three decades of experience in this specialized field and advised by the foremost experts in systems security engineering, global standards authoring, national security-level cyber, and financial technologies.

   Canton already supports adding signing and decryption algorithms, but today that capability is limited to a relatively narrow set of algorithms and incremental, one-at-a-time extensions. QFlex broadens this model by enabling a wider, evolving range of algorithms to be introduced and configured as requirements change. Canton-QFlex gives institutions a more flexible path to adapt to new regulatory, jurisdictional, and post-quantum cryptographic standards without relying on disruptive upgrade cycles.

4. **Backward Compatibility**

   A required constraint to any crypto-agility capability for Canton is backward compatibility. This project addresses this requirement in the following ways:

1. **Separate code path for QFlex -**  
Canton’s current (legacy) cryptographic paths will be untouched and will continue to be operational.
2. **Algorithm maintenance**

   i. **Algorithm matrix curation and enforcement –**

   QFlex will present eddsa, ecdsa, dilithium (3 security levels), sphincs+ (12 variants) from an approved open-source library (most likely BouncyCastle). Only this algorithm matrix will be supported in QFlex including an approved list of hybrid algo combinations. All other signature compositions presented for QFlex processing not on the list will result in a validation error.

   ii. **Algorithm compatibility testing –**

   An extensive algorithm compatibility test suite will be run and analyzed upon any changes to Canton legacy signature code, QFlex code and the underlying cryptographic library codebases. The test suite may include cross compatibility testing with other well-known libraries. For any one algorithm variant, the compatibility tests will result in a pass or fail (with failure mode).

   iii. **New algorithms –**

   After thorough testing, a label will be introduced and released into the network for active use. Only this approved label will be recognized by the QFlex API for proper validation on any transaction.

   iv. **Same algorithm implementation deltas –**

   The different versions of the same library may introduce a delta on the algorithm outputs. These will be labeled and maintained as distinct PQC algorithm variants within QFlex as to maintain backward compatibility with committed transactions.

   v. **Algorithm retirement –**

   Once an algorithm is used in a committed transaction, it cannot be removed; otherwise, backward compatibility may be violated. With community/governance guidance, deprecated algorithms can be prevented within QFlex from being used in new transactions going forward.

3. **Ecosystem Integration Rollout**

   The QFlex rollout to the Ecosystem will be a mandatory infrastructure upgrade for all nodes. Due to the QFlex integration being at the core node level while preserving legacy signature paths, the rollout supports asynchronous PQC transitions by nodes, and the ability to validate legacy and QFlex formatted signatures by any node.

6. **Security Design Principles**

   QFlex redefines secure infrastructure by turning **Security by Design** into active defense. Built to be resilient against modern, shifting threat landscapes, QFlex features an adaptable architecture that handles diverse cryptographic approaches, delivering the exact security methods needed, exactly when and where they are required. This integration of dynamicity and Defense-in-Depth directly reflects the systems security engineering patterns outlined in NIST SP 800-160 Volumes 1 \& 2 and NIST SP 800-53 SC-29. Validated by the NIST SBIR 2024 “Easing Transitions to New Cryptography with Structured Data Folding with Transmutations (SDFT)”, QFlex/SDFT provides an implemented framework that meets or exceeds the highest standards of federal security patterns.

   ## **Milestones and Deliverables**

   This proposal comprises development, maintenance, and licensing milestones. Some deliverables are staged early with ongoing iterations that may extend into later milestones, but in such cases, interim progress reports will be delivered for acceptance review.

   **Milestone 1 - Architecture and Planning**  
Estimated Delivery: +3 Months from grant approval  
Focus (Dev): Research, architect, and plan integration path for QFlex in collaboration with current core architects and key infrastructure stakeholders. Begin development on relevant deliverables.

|Milestone|Deliverable|
|-|-|
|D1.1|Technical specs — QFlex integration pathways|
|D1.2|Algorithm matrix for JAR/scala: ecdsa, eddsa, dilithium, sphincs+|
|D1.3|Hybrid algorithm matrix: TBD during initial discussions D1.1|
|D1.4|Test suite spec \& backward compatibility framework|
|L1.1|Initiate Licensing drafting, discuss licensing details and requirements with Canton|
|Acceptance Criteria: Specifications \& initial documents delivered to Tech \& Ops Committee||

**Milestone 2 - QFlex Core Development**  
Estimated Delivery: +3 Months from Milestone 1 acceptance  
Focus (Dev): BOLTS DEVNET \& BOLTS TESTNET

|Milestone|Deliverable|
|-|-|
|D2.1|Canton protocol extensions - full backward compatibility on BOLTS DEVNET|
|D2.2|Native QFlex integrated into Canton node on BOLTS DEVNET|
|D2.3|PQC signing documentation \& test code|
|L2.1|QFlex license for Canton Network executed. Commence licensing payment.|
|L2.2|QFlex codebase released into publicly accessible Canton repository; dependent on L2.1|
|Acceptance Criteria: Demonstration/test reports + final executed license (ref L2.1)||

**Milestone 3 – Integration \& dApp adoption**  
Estimated Delivery: +3 Months from Milestone 2 acceptance  
Focus (Dev): BOLTS TESTNET → Canton DevNet/TestNet; begin adoption work

|Milestone|Deliverable|
|-|-|
|D3.1|Full algorithm matrix (D1.2 \& D1.3) tested on Canton DevNet|
|D3.2|Community issue handling process for QFlex documented|
|D3.3|All critical and high-severity bugs resolved; bug tracking report delivered|
|A3.1|dApp design, architecture, and development initiated for adoption partner|
|Acceptance Criteria: Stability \& Regression report(s); Adoption progress report||

**Milestone 4 – Hardening \& general release**  
Estimated Delivery: +3 Months from Milestone 3 acceptance  
Focus (Dev): Hardening, rollout for network adoption \& dApp adoption

|Milestone|Deliverable|
|-|-|
|D4.1|Advance QFlex to Canton MainNet|
|D4.2|SLO incident response runbook documented, reviewed \& exercised|
|D4.3|Developer guides published|
|D4.4|Benchmark performance report|
|A4.1|Adoption complete A3.1|
|D4.5|Publish supported algorithm matrix on website|
|Acceptance Criteria: MainNet release + dApp live on MainNet + ecosystem activation evidence||



**Milestone 5: Maintenance**  
Commences after Milestone 4 acceptance on a quarterly basis.  
Focus: Support for QFlex in Canton including incremental improvement and continued alignment with cryptographic standards.

Each quarter, BOLTS submits a Quarterly Review Report to the Tech \& Ops Committee covering all three metrics below, including live technical demonstrations as needed. The Quarterly Review Report shall be submitted no later than 30 days following the end of each calendar quarter. Upon submission, the committee shall have 30 days to review the report and raise any material shortfalls. If no such shortfalls are raised within this period, the report shall be deemed accepted.  
If the committee identifies material shortfalls, BOLTS has 30 days to present a remediation plan. Failure to remediate within this period may result in suspension or termination of future disbursements.

**Maintenance Scope**

* **Stability:** Regular bug fixes and regression testing.
* **Security:** Proactive identification and resolution of vulnerabilities.
* **Reliability:** Stable releases with backwards compatibility assurance.
* **Community Support:** Maintenance and review of external contributions and documentation updates.

**Maintenance Quarterly Evaluation Metrics**  
**Metric 1: QFlex Maintenance**

* Supported algorithm matrix continues to be aligned with relevant standards.
* Relevant global PQC standards and regulations monitored.
* Additional algorithm requests tracked, reviewed, analyzed, and proposed.
* Quarterly Algorithm Status Report provided.

**Metric 2: Security \& Reliability**

* Stable operation.
* Service Level Objectives:
  * Critical security vulnerabilities reported via the responsible disclosure process have a mitigation plan or patch available within 48 hours of discovery.
  * Pull Requests from external contributors reviewed within 5 business days.
* Annual/Incremental Security Audits based on changes to integration and dependencies.
* Quarterly Incident Report provided.

**Metric 3: Developer Experience and Ecosystem Enablement**

* Documentation updates are maintained and published.
* Ecosystem activity (event, workshop, or co-marketing initiative) as needed in coordination with Canton.
* Quarterly Ecosystem Report provided.

## **Licensing Terms**

For the general benefit of the Canton ecosystem, a license is proposed in the form of a Canton Ecosystem Source-Available License (the Canton-QFlex license) + dual licensing structure. The Canton-QFlex license will have mutually agreed upon features during the Licensing discussion including:

* License limited to Canton ecosystem activities by any ecosystem actor
* Renewable annually for 10 years, thereafter free of fees.
* Canton-QFlex source code:
  * Publicly available upon Licence activation L2.1
  * Forkable and modifications allowed
  * All modifications are co-owned by Canton and BOLTS
  * If BOLTS ceases to operate, Canton can continue independent maintenance and development



**Adoption Goal**

Integrate access to QFlex capabilities with IntellectEU's CatalyX product platform.

## **Funding**

**Total Funding Request:**  
Initial reference price: 0.15 USD/CC

**Development/Integration**  
Duration:	12 months (4 quarters)  
Monthly:	600,000 CC  
Total:		7,200,000 CC

**Adoption**  
Duration:	During development quarters 3 and 4)  
Total:		7,200,000 CC

**License**  
Duration:	Annual  
Monthly:	400,000 CC  
Total:		4,800,000 CC

**Maintenance**  
Duration:	Annual  
Monthly:	300,000 CC  
Total:		3,600,000 CC

Acceptance of each milestone type results in payment of the full milestone funding even if completed earlier than estimated. We recognize that certain deliverables may complete ahead of schedule and others may extend or overlap due to the nature of the deliverable, unanticipated integration issues, scope creep, and coordination of testing and/or deployment processes. Any such issues which require delaying deliverables to a later milestone shall be discussed and coordinated with the review committee.

**Review and off-ramps**: Milestone evaluation by the Tech \& Ops Committee (or Core Contributor Group) based on the milestone acceptance criteria and deliverables. The Committee may suspend or terminate future payments after any quarter or milestone if performance falls short.

**Payment schedule**: Monthly disbursements at the end of each month, starting upon approval. Payment may be delayed if the Committee raises a performance challenge and voting members approve the delay.

## **Volatility Stipulation**

* **Scope modifications and evolution**  
Scope creep and modifications are probabilistic realities of deep infrastructure alterations. We propose that if the project milestones, deliverables, and/or timelines are unexpectedly altered, we will initiate discussions with the committee to determine the best approach to meet the original cost, schedule, and performance objectives.
* **USD/CC price volatility for Development/Integration/Adoption**
This proposal exceeds the six-month threshold for fixed Canton Coin denomination. The requested funds will maintain the project’s essential development and support staff.

  To address CC/USD volatility over the duration of the program, the Canton Coin denomination for future milestone periods may be periodically rebased using the 30-day moving average CC/USD price sourced from Coingecko at the beginning of the applicable funding period. The rebasing mechanism protects the foundational funding baseline required to sustain the project’s technical and strategic capabilities.

For the Licensing and Maintenance phases, we expect that this project will add value to the Canton Network and desire to take the risk of floating the funding at market CC rates.

  ## **Co-Marketing**
  BOLTS will assist Canton Foundation activities which may include:
* Joint announcements of major ecosystem developments and upgrades.
* Technical blog posts detailing features built and insights.
* Content and Tutorials: Developer-focused content about the API and integration possibilities.
* Dedicated Canton Network Page on boltstechnologies.xyz serving as a hub for Canton developers.
* Inclusion of Canton Foundation branding on BOLTS as a grant recipient.
## **Motivation**
  In most blockchain systems including Canton, transaction authorization and asset ownership are secured primarily through digital signatures, the most common being elliptic curve cryptography (ECC), valued for its small sizes and fast speed.

  In 1994, Peter Shor’s algorithm alerted cryptographers to a profound future risk: a sufficiently powerful quantum computer could break the most widely deployed public-key cryptosystems, including ECC and RSA. Three decades later, continued advances in quantum computing have made that risk more urgent as “Q-Day” seems nearer than before, the day when a cryptographically relevant quantum computer can crack ECC and RSA.

  The National Institute of Standards and Technology (NIST) has long been one of the world’s most influential cryptographic standards bodies. In response to the quantum threat, NIST approved its first post-quantum cryptography standards in August 2024. But the global cryptographic landscape has matured significantly over the past half century: China, South Korea, and other entities are pursuing their own PQC standardization efforts producing a growing number of PQC algorithms and variants. This fragmentation of the global cryptographic landscape is one in which interoperability, compliance, assurance, and crypto-agility will matter critically as much as algorithm selection, if not more so.

  Globally, there are already over 30 PQC variants with more in the standardization pipeline. The reason is simple: no public-key cryptosystem, whether RSA, ECC, or PQC, is proven secure in an absolute mathematical sense. RSA and ECC earned trust through decades of “road wear”; PQC algorithms do not have the luxury of buying time. As evidenced by the Rainbow and SIKE PQC candidate algorithm failures, any PQC variant may be found vulnerable overnight by a breakthrough in cryptanalysis, quantum capability, or implementation attacks.

  In its fullest instantiation, the BOLTS approach does not rely on a single PQC variant or hybrid signature scheme. Instead, it provides a unique agile cryptographic capability – that is, the capability to rapidly switch signature algorithms at the transaction level. Quantum-era risk requires precise, dynamic mitigation at the speed of relevance.

  Canton is positioning itself as a leading privacy-enabled, trustworthy blockchain network for institutional assets and synchronized financial markets. In anticipation of Q-Day, jurisdictional cryptographic compliance requirements, institutional preferences, and the required cryptographic interoperability of composable contracts and transactions, QFlex addresses a core cryptographic logistics problem: delivering the right cryptography at the right point and time.

  This proposal establishes the cryptographic foundation for Canton to evolve to transaction-level crypto-agility over time. Canton + QFlex can help decouple asset-level security choices from network-wide cryptographic defaults, giving asset owners a new layer of risk control that is not generally available in today’s blockchain architectures. By natively integrating QFlex, Canton would present a compelling value proposition for institutions looking to maintain control over their asset security while transacting globally.

  ## **Rationale**

  BOLTS is committed to enabling and strengthening Canton’s quantum resiliency by delivering and maintaining production-grade crypto-agility to the ecosystem.

  This proposal will develop, implement and maintain quantum resilience capabilities on the Canton infrastructure that was successfully piloted and demonstrated in March and May of 2026.

  BOLTS brings deep expertise in cryptographic logistics with the only NIST validated message-level crypto-agile solution for PQC algos (2024 NIST SBIR grant). Our team has 38 patents in applied cryptographic inventions and is advised by Dr. Ron Ross, former NIST Fellow and recipient of the Presidential Rank Award for his research and leadership in creating the NIST Risk Management Framework and NIST SP 800-53, the gold standard in global cybersecurity.

  Our objective is to structure a strategic, long-term alignment to build and deliver industry-leading quantum resiliency for Canton by mid-2027, while also ensuring operational stability for BOLTS.

