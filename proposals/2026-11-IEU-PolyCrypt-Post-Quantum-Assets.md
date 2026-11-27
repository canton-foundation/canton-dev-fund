**Development Fund Proposal:**   
**Post-Quantum Assets on Canton**

**Organization:** IntellectEU and PolyCrypt

**Author / Primary Contact:** @matvii-ieu (IntellectEU), [steffen@perun.network](mailto:steffen@perun.network) (PolyCrypt) 

**Status:** Submitted

**Created:** 2026-11-27

**Proposal Type:** Individual Initiative

**Champion:** Jonathan Mayeur

**Total Funding Request:** 13,000,000 CC

**Project Duration:** 26 weeks for phase 1; the phase 2 milestones are estimated at 30 weeks, with up to 6 more months to meet their adoption thresholds

**Label:** token-asset-standards

# **Abstract**

We propose to develop a set of Daml interfaces and wallet functionality that bring post-quantum signatures to Canton assets as an authorisation mechanism. Holders of these assets can opt in to post-quantum protection: once they do, transfers and other actions on their holdings additionally require a hash-based post-quantum signature, verified on-ledger in Daml. As a result, ownership of protected holdings cannot be taken over by forging the owner’s conventional keys, even once quantum computers capable of breaking conventional signature schemes emerge. The proposal delivers production-ready infrastructure for creating post-quantum assets as a pure add-on: it requires no protocol upgrade and has no effect on assets that do not adopt it or on holders who do not opt in, so Canton users can protect their assets from quantum attacks without waiting for a protocol-level migration.

The project has two phases: infrastructure development, followed by adoption support. Phase 1 delivers:

1. Daml interfaces for authorising asset actions with post-quantum signatures, a Daml implementation of the signature verification logic, and a key account contract for storing post-quantum public keys.  
2. An off-ledger, wallet-side library implementing the required cryptographic primitives, delivered as an extension of the Canton Wallet SDK, so that wallets can manage the new keys and support post-quantum assets.

In phase 2, the adoption phase, we will document the Wallet SDK extension and the authorisation framework, and develop an example wallet and an example asset with adoption guidelines, serving as references for supporting post-quantum assets in wallets and adopting post-quantum authorisation in asset contracts, so that other parties on the network can use it quickly, without costly in-house development. We will collaborate with developers of tokenisation tooling to adopt the framework in their tools. We will also help wallet providers add support for the new assets, and contribute to wider adoption efforts across the network in general. Phase 2 consists of two milestones, which are accepted and paid separately, each only on reaching its adoption thresholds on MainNet, such as the number of wallets supporting post-quantum assets or the number of post-quantum assets issued.

# 

# **Specification**

## **1\. Objective**

Canton currently relies on conventional elliptic-curve signatures to authorise transactions. A sufficiently large quantum computer could break these signatures efficiently using Shor’s algorithm, allowing an adversary to forge them and steal assets. In this proposal, we implement a hash-based post-quantum signature scheme in Daml that acts as a second, independent layer of authorisation for assets, without requiring any changes to the Canton protocol. We deliver it as a framework of Daml interfaces and templates that any token-standard asset can use to offer post-quantum authorisation to its holders as an option, demonstrated with a simple example asset, and make it available to wallets through an extension of the Canton Wallet SDK.

The intended outcome is that holders of a post-quantum asset can choose post-quantum protection: once a holder opts in, moving their holdings requires a valid signature from their post-quantum key, in addition to the usual Canton authorisation, while holders who do not opt in use the asset as before. Because post-quantum keys must be bound to their owners while conventional signatures can still be trusted, this infrastructure needs to be in place well before such quantum computers exist. Protocol-level signatures and the encryption of transaction data are out of scope; they are addressed by Canton’s own planned migration to post-quantum cryptography.

## **2\. Implementation Mechanics**

We start by surveying the current state of hash-based post-quantum signature schemes: their signature sizes, performance characteristics and implementation complexity in Daml specifically. Our current preferred stateful candidate is XMSS, which is built on the WOTS+ one-time signature, and our preferred stateless candidate is SLH-DSA, the standardised form of SPHINCS+ (FIPS 205). 

On the ledger side, a Daml developer first implements the verifier for the selected schemes as a reusable Daml library. On top of it, we build the authorisation framework and a test asset contract that follows the existing token standards while letting its holders opt in to post-quantum signatures for authorising actions on their holdings.

On the client side, a systems developer implements key generation and signing in a client library and packages it as an extension of the Canton Wallet SDK, the TypeScript toolkit for building Canton wallets, so that any wallet built on the SDK can reuse it.

Our cryptographers supervise and review both implementations, checking the underlying mathematics and watching for known pitfalls in applying the schemes. Each component is tested as it is built, and once both sides are in place, end-to-end tests with a test asset contract and a minimal demo client verify that the Daml verifier and the client library agree with each other and with the schemes’ reference test vectors, and that post-quantum authorisation of transfers works across the whole system.

The resulting framework separates three concerns. A Daml library implements signature verification. A key account contract, one per owner, stores the owner’s current post-quantum public keys and implements a small authoriser interface, which checks that a message was signed under those keys. Asset templates implement the standard token interfaces and, before moving any holdings, build a canonical message describing the requested action (input holdings, recipient, amount, deadline and key version) and ask the owner’s key account to authorise it. The wallet builds the same message off-ledger, signs it, and passes the signature in the metadata of the corresponding token-standard call, such as a transfer. Because the message names the input holdings, which are consumed when spent, a signature cannot be replayed.

An owner binds a post-quantum key to their Canton party once, in a registration step authorised through the party’s existing Canton authorisation together with a proof of possession of the new key. After that, any key change must be signed with the current post-quantum key, so an attacker who later forges conventional signatures cannot take over the account.

Both the on-ledger verification code and the client-side code for key generation and signing are designed for reuse: other Daml applications can use the verifier, and any wallet built on the Canton Wallet SDK can adopt the client library through the SDK extension. All code written for this project will be open-sourced for independent verification and reuse. In addition, we will distribute the phase 1 Daml packages through CatalyX Package Manager (CPM) free of charge for one year after their release. CPM records each package’s hash on the Canton ledger, so validator operators can verify that the package they install is exactly the one we published, and it notifies subscribers of new versions, including security fixes. Using CPM is optional: the same packages remain available from the open-source repositories.

Finally, we will document the design rationale, explain how to use the framework correctly, and provide migration guidance for users who want to adopt the post-quantum asset workflow.

## **3\. Architectural Alignment**

This project contributes to addressing the quantum threat by effectively mitigating its most direct risk, asset theft, while remaining as non-intrusive to the infrastructure as possible: it runs entirely as Daml code at the application layer. It complements Canton’s planned protocol-level migration to post-quantum signatures, as it is available before that migration and remains an independent, hash-based second factor afterwards. It can also serve as a basis for a future native integration and contributes to the wider discussion around Canton’s post-quantum migration. 

The post-quantum authorisation logic is introduced as a small set of Daml interfaces that complement the Canton Network Token Standard (CIP-0056 and CIP-0112) rather than replace it. Assets built on them still implement the standard interfaces, so existing wallets and applications can display them and parse their transaction history; only holders who opt in to post-quantum protection need a post-quantum-aware wallet to move their holdings, while other holders keep using their existing wallets. Post-quantum signatures are passed through the standard’s existing extension points, such as choice metadata and the choice context returned by the registry API. The framework is designed so that existing tokenisation tools, such as registry applications, can offer post-quantum authorisation as an optional setting with minimal integration effort; in the adoption phase, we work with their developers to do so.

## **4\. Backward Compatibility**

*No backward compatibility impact.*

The solution requires no changes to the Canton protocol, the token standard or any existing Daml packages. It is fully opt-in, at two levels: an asset offers post-quantum authorisation only if its issuer or registrar enables it, and within such an asset each holder decides whether to use it. Existing assets, parties and wallets are unaffected.

# **Milestones and Deliverables**

## *Phase 1*

Phase 1 is the infrastructure phase. It delivers the open-source building blocks for post-quantum authorisation on Canton: the selected signature schemes, their verification logic in Daml, the authorisation interfaces and key account contract, a client-side signature library, and an extension of the Canton Wallet SDK. Each milestone includes tests showing that its component works correctly, both on its own and together with the components delivered before it. By the end of the phase, all components work together end to end: a holder of a post-quantum asset built with the authorisation interfaces can opt in to post-quantum protection and then hold and transfer the asset using the Wallet SDK extension, with every transfer of their holdings authorised by a post-quantum signature. Together, these components form the complete post-quantum authorisation framework. Phase 1 delivers the complete framework; phase 2 is dedicated to its adoption in the network.

## Milestone 1: Selection of the cryptographic scheme

* **Committed Date:** *4 weeks into the project.*  
* **Focus:** Cryptographic design. Hash-based signatures come in many variants: stateful schemes such as XMSS/XMSS^MT and LMS/HSS, the stateless SPHINCS+ (standardised as SLH-DSA), and recent generalisations with alternative encodings (e.g. target-sum and hypercube encodings). Each comes with parameters (hash output length, Winternitz parameter, tree height and number of layers, tweakable-hash construction) that trade signature size against verification cost. Stateful schemes are usually more efficient in speed or signature size, but the signer must keep reliable state so that no one-time key is ever used twice; on Canton, the ledger’s UTXO model could enforce this by binding a fresh one-time key to each holding. The deciding constraints for candidate schemes on Canton are the cost of verification inside Daml and the available hash functions: Daml provides SHA-256 and Keccak-256 as built-ins, but not SHAKE or SHA-512, which limits the usable parameter sets. Signature sizes are less critical than on conventional blockchains, but they still matter, as they affect storage and traffic costs.  
* **Deliverables / Value Metrics:** A survey of hash-based signature schemes and encodings that are viable in Daml; the selection and specification of two schemes, one stateful and one stateless, with concrete parameter sets, security levels and underlying hash assumptions; a performance estimate for on-ledger verification of both schemes (hash evaluations, signature and key sizes), checked against Canton’s practical limits on transaction size, processing time and traffic cost; and reference test vectors for both schemes, against which the implementations in the following milestones are tested.

## Milestone 2: Signature verification logic in Daml

* **Committed Date:** *10 weeks into the project.*  
* **Focus:** The Daml developer implements the verification logic of the selected post-quantum signature schemes under the supervision of the cryptographer, who then reviews the code. The verifier is tested against the reference test vectors from Milestone 1, including tampered, truncated and wrong-key cases, and its verification cost is measured on a local Canton network.  
* **Deliverables / Value Metrics:** A reusable Daml library implementing verification for each selected scheme, which checks a post-quantum signature against a public key and a message, validated against the schemes’ reference test vectors.

## Milestone 3: Client-side post-quantum signature library

* **Committed Date:** *14 weeks into the project.*  
* **Focus:** The systems developer implements both post-quantum signature schemes in full (key generation, signing and verification) for client-side use, in the form of a separate reusable library with an API for use in wallet applications, under the supervision of the cryptographer. The library is tested against the same reference test vectors and cross-checked against the Daml verifier from Milestone 2, so that signatures produced on the client are accepted on the ledger.  
* **Deliverables / Value Metrics:** A reusable software library for key generation, signing and signature verification for both selected schemes, including safe state management for the stateful scheme and the canonical message encoding, cross-checked against the Daml verifier.

## Milestone 4: Post-quantum asset authorisation framework

* **Committed Date:** *20 weeks into the project.*  
* **Focus:** Daml developers design and implement a framework of interfaces and templates for authorising asset actions with post-quantum signatures. To test the framework together with the Daml verifier and the client library, we build a test asset contract that offers post-quantum authorisation to its holders, and test opting in, key registration and rotation, transfers by holders with and without post-quantum protection, and the rejection of missing, invalid or replayed signatures for protected holdings. The cryptographer reviews the framework’s design and code.  
* **Deliverables / Value Metrics:** A set of Daml interfaces defining the authorisation logic, under which holders can opt in to post-quantum protection, after which actions on their holdings require a valid post-quantum signature by the owner over a canonical description of the action, and opting out again also requires such a signature; a key account contract template that holds the owner’s post-quantum public keys and supports key registration and rotation; a test asset contract with tests covering the framework together with the verifier and the client library; and a design document that includes a threat model describing what the post-quantum layer protects and what it does not.

## Milestone 5: Wallet SDK extension

* **Committed Date:** *26 weeks into the project.*  
* **Focus:** The systems developer packages the post-quantum signature library as an extension of the Canton Wallet SDK, so that any wallet built on the SDK can adopt it. Wallets keep using the party’s existing Canton signing key to submit transactions, and, for users who opt in, additionally manage post-quantum keys that authorise spending their protected holdings. The extension handles opting in, key registration and rotation, builds the canonical message for each action and attaches the post-quantum signature to the corresponding token-standard call, so that post-quantum assets add no extra friction: users follow the same workflow as for conventional assets. Finally, we test the complete system end to end: a minimal demo client built on the extension opts in by registering post-quantum keys and holds, sends and receives the test asset, with every transfer authorised by a post-quantum signature that the Daml verifier accepts, and missing, invalid or replayed signatures rejected.  
* **Deliverables / Value Metrics:** A Wallet SDK extension, in line with the developed interfaces, that lets wallets register and rotate post-quantum keys and hold, send and receive post-quantum assets, tested end to end with the test asset contract and a minimal demo client. The phase 1 packages are released in the open-source repositories and made available on CPM free of charge for 1 year; with this milestone, the post-quantum asset authorisation framework is complete.

## *Phase 2*

Phase 2 is the adoption phase and consists of two milestones: Milestone 6 supports the adoption of post-quantum assets in wallets through the Wallet SDK extension, and Milestone 7 supports the adoption of the authorisation framework in assets by registries, developers of tokenisation tooling and issuers. The two milestones run in parallel and are accepted and paid separately, each based solely on its adoption thresholds on MainNet.

## Milestone 6: Adoption of post-quantum assets in wallets

* **Committed Date:** *34 weeks into the project.*  
* **Focus:** We publish documentation of the Wallet SDK extension and extend the minimal demo client from Milestone 5 into an example wallet implementation with adoption guidelines, to serve as a reference for wallet providers. We work directly with wallet providers to help them add support for post-quantum assets to their products using the Wallet SDK extension.  
* **Deliverables / Value Metrics:** Documentation of the Wallet SDK extension; an example wallet implementation built on it, with adoption guidelines for wallet providers; and *at least 3 independent wallets supporting post-quantum assets* in a public production release (see Acceptance Criteria).

## Milestone 7: Adoption of the authorisation framework in assets

* **Committed Date:** *34 weeks into the project.*  
* **Focus:** We publish documentation of the authorisation framework, including the key account contract and the design rationale, and extend the test asset contract from Milestone 4 into an example asset with adoption guidelines for registries, developers of tokenisation tooling and issuers. We work directly with developers of tokenisation tooling, such as registry applications on Canton, to help them offer post-quantum authorisation as an optional setting for the holders of their instruments, support issuers in launching their first post-quantum assets on MainNet, and present the framework to the ecosystem through technical publications. To simplify deployment for validator operators, all the phase 1 packages are distributed through CPM free of charge for 1 year.  
* **Deliverables / Value Metrics:** Documentation of the authorisation framework; an example asset built with it, with adoption guidelines for registries, developers of tokenisation tooling and issuers; post-quantum authorisation available in *at least 3 distinct tokenisation tools or asset implementations* built with our framework; and at least 3 qualifying post-quantum assets issued on MainNet by *at least 3 distinct issuers*, with a *combined outstanding value of at least USD 3M* (see Acceptance Criteria).

# 

# **Acceptance Criteria**

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone  
* Demonstrated functionality or operational readiness  
* Documentation and knowledge transfer provided  
* Alignment with stated value metrics

Acceptance differs between the two phases.

**Phase 1** milestones are accepted individually, upon delivery of the promised component as specified in the milestone’s deliverables and, where applicable, a demonstration of its functionality to the Committee on a Canton test network.

**Phase 2** milestones are also accepted individually, but solely on meeting the adoption thresholds on MainNet set out in their deliverables and value metrics; delivering the example implementations, documentation and adoption guidelines does not by itself complete a milestone. The thresholds are interpreted and verified as described below. In them, a *post-quantum asset* is an asset that offers post-quantum authorisation through our framework: its holders can opt in, after which transfers of their holdings require a valid post-quantum signature.

1. **Wallet support (Milestone 6).** A wallet counts towards the threshold if it supports post-quantum assets in a public production release: users can opt in by registering post-quantum keys and then hold, send and receive post-quantum-protected holdings with it. Wallets count only if they are independent of each other, and our own example wallet doesn’t count.  
    *Verification:* the wallet’s public release notes or documentation. In addition, for each wallet, either the MainNet transaction ID of a post-quantum-authorised transfer made with it, or a live demonstration to the Committee.  
2. **Tokenisation tool integrations (Milestone 7).** Post-quantum authorisation can be made available as an optional instrument setting in a registry or tokenisation platform, or in a standalone asset implementation built with our framework. Integrations count as distinct only if they are separate products from different developers; redeployments of the same tool count once.  
    *Verification:* public documentation, release notes or source code showing the integration, plus at least one MainNet instrument per integration with post-quantum authorisation enabled.  
3. **Issued volume of qualifying assets (Milestone 7).** Only qualifying assets count towards the issued volume. The threshold is met when their combined outstanding value is at or above it on at least 15 days of a 30-day period, based on daily figures confirmed by the issuers or taken from the total supply published by their registries.  
     
   * A *qualifying asset* is issued by a legally identifiable entity and represents a claim on an identifiable underlying asset or obligation. Examples include tokenised securities, fund units, deposits, reserve-backed stablecoins and commodities.  
   * Assets without an underlying reference value, such as meme coins, don’t qualify. Neither do test assets, or assets issued by the applicant or its affiliates.

   *Verification:* holdings on Canton are visible only to their stakeholders, so issued volume can’t be read from public ledger data alone. For each asset, it is evidenced in **one** of three ways:

   * MainNet transaction IDs and registry API data shared with the Committee, where the issuer’s compliance team allows it;  
   * A signed confirmation from the issuer or registrar, submitted privately to the Canton Foundation, stating the instrument, its outstanding value and its use of the framework;  
   * A public announcement by the issuer.

*The adoption thresholds of each phase 2 milestone can be met within 6 months of its estimated delivery date; otherwise, that milestone is not paid.*

# **Funding**

**Total Funding Request:** 

*13,000,000 CC*, of which *6,500,000* *CC* is for phase 1 and *6,500,000 CC* is for phase 2\.

## **Payment Breakdown by Milestone**

Phase 1 milestones are paid upon committee acceptance of the delivered component.

* **Milestone 1 (Selection of the cryptographic scheme):** *500,000 CC* upon committee acceptance (*400,000 CC to PolyCrypt, 100,000 CC to IntellectEU*).  
* **Milestone 2 (Signature verification logic in Daml):** *1,000,000 CC* upon committee acceptance (*200,000 CC to PolyCrypt, 800,000 CC to IntellectEU*).  
* **Milestone 3 (Client-side post-quantum signature library):** *1,250,000 CC* upon committee acceptance (*1,250,000 CC to PolyCrypt*).  
* **Milestone 4 (Post-quantum asset authorisation framework):** *2,250,000 CC* upon committee acceptance (*250,000 CC to PolyCrypt, 2,000,000 CC to IntellectEU*).  
* **Milestone 5 (Wallet SDK extension):** *1,500,000 CC* upon committee acceptance  
  (*1,200,000 CC to PolyCrypt, 300,000 CC to IntellectEU*).

Phase 2 milestones are paid separately, each only upon meeting its adoption thresholds.

* **Milestone 6 (Adoption of post-quantum assets in wallets):** *3,250,000 CC* upon meeting the milestone’s adoption thresholds and committee acceptance  
  (*2,600,000 CC to PolyCrypt, 650,000 CC to IntellectEU*).

* **Milestone 7 (Adoption of the authorisation framework in assets):** *3,250,000 CC* upon meeting the milestone’s adoption thresholds and committee acceptance  
  (*350,000 CC to PolyCrypt, 2,900,000 CC to IntellectEU*).

# **Co-marketing**

Upon release, the implementing entity will collaborate with the Foundation on:

* Announcement coordination  
* Case study or technical blog  
* Developer or ecosystem promotion

# **Motivation**

Canton currently relies on conventional cryptography to manage identities and secure assets. Digital Asset has announced plans to introduce post-quantum algorithms into the Canton protocol, but completing that migration across the network is a major undertaking: participants, synchronizers and parties all have to rotate their keys, and applications and wallets have to follow. Meanwhile, the deadlines are becoming concrete. NIST’s final IR 8547 (October 2026\) deprecates quantum-vulnerable signature algorithms such as ECDSA and EdDSA after 2030 and disallows them after 2035, and the EU’s coordinated roadmap expects high-risk use cases to have a quantum-safe upgrade path by the end of 2030\. Tokenised assets with long lifetimes, such as bonds or fund units maturing in the 2030s, need protection that lasts for their whole lifetime from the day they are issued.

This project protects against the most critical consequence of a quantum attack, asset theft, now and without modifying the core of Canton. Issuers can offer post-quantum authorisation as an option for their assets, and any holder can opt in by registering post-quantum keys, so that moving their holdings requires a valid post-quantum signature from them. The remaining quantum risk is then concentrated in protocol-level infrastructure, which Canton’s own migration covers, and in privacy-related attacks such as “harvest now, decrypt later.” Early availability matters, because post-quantum keys must be bound to their owners while conventional signatures can still be trusted: owners who register their keys early are protected regardless of when a capable quantum computer appears.

We expect the solution to be most relevant for issuers and registrars of long-lived or high-value assets, such as tokenised bonds, funds and deposits, and for regulated institutions that must demonstrate a post-quantum transition plan. On the holder side, every wallet that integrates the client library makes post-quantum protection available to all of its users. 

Long term, the solution serves as a reference point in the discussion of Canton’s post-quantum migration. After that migration, it remains useful as an independent, hash-based second factor, and parts of it, such as the on-ledger verifier or the key account model, could be adopted into Canton’s own tooling. This second-factor role is particularly relevant given recent advances in AI-assisted cryptanalysis: combining schemes based on two different sets of assumptions (hash functions and lattices) is more robust than relying on either one alone.

# **Rationale**

The design follows the principle of extending what exists: it adds post-quantum authorisation on top of Canton and its token standard, rather than replacing any part of them.

**Application layer instead of protocol changes.** We could instead have modified the Canton core, either replacing its signature scheme with a post-quantum one or adding a second signing key that users could choose to sign with. Such an invasive approach would mean critical work on a codebase maintained by others, close coordination with its maintainers, a network-wide rollout and a migration plan. Digital Asset is also already working on post-quantum algorithms at the protocol level, with ML-DSA signing available as an experimental feature, so a second protocol-level effort would duplicate that work. As an add-on, our solution needs no changes to Canton, can be adopted asset by asset and holder by holder, covers the period until the protocol migration is complete, and complements that migration instead of competing with it.

**Hash-based rather than lattice-based signatures.** Hash-based schemes rely only on the security of the underlying hash function, which makes them the most conservative post-quantum choice: SLH-DSA is standardised in FIPS 205, and XMSS and LMS in NIST SP 800-208. They can also be verified in Daml using its built-in SHA-256 function. Lattice-based ML-DSA would require implementing the SHAKE hash functions in Daml from scratch, at a much higher cost, and it will arrive natively through Canton’s protocol migration anyway. Using both eventually gives owners two independent post-quantum factors based on different security assumptions.

**Complementing the token standard instead of defining a new one.** Post-quantum assets implement the existing CIP-0056 and CIP-0112 interfaces, and signatures travel through the standard’s existing extension points. Existing wallets and applications can therefore display and track these assets, and holders who do not opt in can keep moving them with their existing wallets; only holders who opt in need a post-quantum-aware wallet. The only new element is the authorisation step, which is captured in a small, separate interface that any asset can use.

**Binding post-quantum keys to existing parties.** We considered making asset ownership independent of Canton parties, with a new layer of identities defined by post-quantum keys. Binding the keys to existing parties instead keeps the asset model compatible with the token standard, which identifies owners by party, and leaves Canton’s privacy and hosting model unchanged. Each owner has their own key account contract rather than an entry in a shared registry, which keeps keys private and avoids contention between owners.

**Reusing existing ecosystem tooling.** The wallet-side library is delivered as an extension of the Canton Wallet SDK, so any wallet built on the SDK can adopt it. For the adoption phase, the framework is designed to be integrated into existing tokenisation tools as an optional setting, rather than offered as a separate implementation. The packages are installed through Canton’s standard package vetting and distributed through the open-source repositories and, optionally, CPM.

**Crypto agility.** Post-quantum cryptography is still evolving, with new encodings and parameter sets being proposed, so we do not expect our scheme selection to be final. Key accounts therefore record which scheme each key uses, so that new schemes, including Canton-native post-quantum keys once they are available, can be added without changing the assets that rely on them.

