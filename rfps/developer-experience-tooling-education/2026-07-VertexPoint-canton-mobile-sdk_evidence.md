### Mobile apps in progress

Grofty roadmap, the iOS app for iPhone and iPad is in the In Progress column (Q3 2026). The Android app from the same column is already on Google Play  
https://grofty.cc/#roadmap  
https://play.google.com/store/apps/details?id=com.groftylab.grofty

Edel API docs, an endpoint that hands the signed-in web session to its native app. No store listing yet  
https://docs.edel.finance/developers/api-reference/auth/hand-the-signed-in-session-to-the-native-app

Owarine, a prediction market from HackCanton Season 3, lists its native mobile app (built with Expo) as in development  
https://github.com/Blockchain-Oracle/owarine#beyond-the-hackathon

vbloher in the #574 thread, building a DeFi project with mobile apps on its roadmap  
https://github.com/canton-foundation/canton-dev-fund/pull/574#issuecomment-5025683046

### Mobile wallet apps that support Canton

Console Wallet (PixelPlex), iOS and Android, 10K+ installs on Google Play  
https://apps.apple.com/us/app/console-wallet/id6754840343  
https://play.google.com/store/apps/details?id=io.ccview.wallet

C8 Wallet (Cantor8), iOS and Android, 10K+ installs on Google Play  
https://apps.apple.com/us/app/c8-wallet/id6758641279  
https://play.google.com/store/apps/details?id=tech.cantor8.wallet.canton

Cansai (Tenkai), iOS  
https://apps.apple.com/us/app/cansai/id6757304350

Askardex, Android  
https://play.google.com/store/apps/details?id=com.askardex.appwallet

Grofty Wallet, Android  
https://play.google.com/store/apps/details?id=com.groftylab.grofty

Nightly, iOS, Canton in the version history since April  
https://apps.apple.com/us/app/nightly-multichain-wallet/id6444768157

Cypherock cySync, iOS, the companion app of a hardware wallet, Canton added in May  
https://apps.apple.com/us/app/cypherock-cysync-crypto-wallet/id6743165054

### The Foundation's wallet directory

6 of the 11 wallets list a mobile form factor (Askardex, Blockdaemon Institutional Vault, Console, Ledger, Nightly, Send)  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/WALLET_DIRECTORY.md

They reach dApps in different ways. Askardex and Send list WalletConnect, Console lists its own QR pairing with the mobile app  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/wallets/askardex-wallet.yaml#L49-L50  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/wallets/send.yaml#L48-L49  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/wallets/console-wallet.yaml#L48-L50

Ledger Wallet's entry says dApp connectivity for Canton is not available yet  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/wallets/ledger-wallet.yaml#L54-L56

"Wallet Gateway signing driver" is a feature the directory tracks. Only Dfns and Blockdaemon have it, both custody providers  
https://github.com/canton-foundation/wallets/blob/f0aaf7735c/wallets/_feature_registry.yaml#L147

### Teams and developers about phones

OneSwap's beta report (May), Loop, a web wallet, was the more accessible option for users coming in from mobile. The trade-off was its signing flow, where a few testers hit timeouts and signing loops  
https://www.oneswap.cc/blog/what-our-beta-testers-taught-us

Ekiden Wallet docs, browser extension only, no QR or mobile session, no WalletConnect  
https://docs.ekiden.fi/wallet/overview

Console's dApp SDK has a mobile connect flow (QR code on desktop, deep link on the phone), about 12,000 npm downloads in the last 30 days  
https://www.npmjs.com/package/@console-wallet/dapp-sdk

A developer survey answer quoted in DA's reference wallet proposal asks for an official wallet as a browser extension and a mobile app  
https://github.com/canton-foundation/canton-dev-fund/blob/1445524ce8/proposals/2026-03-DA-proposal-open-source-reference-wallet.md?plain=1#L38

### Digital Asset and the Wallet Gateway

Review of #574 by @mjuchli-da (Digital Asset), supports a mobile signing driver for the Gateway and says a customer base "would want to rely on a mobile phone as a key store device"  
https://github.com/canton-foundation/canton-dev-fund/pull/574#issuecomment-6685038319

The Gateway's own grant names mobile wallets among the key stores it is meant to work with  
https://github.com/canton-foundation/canton-dev-fund/blob/1445524ce8/proposals/wallet-gateway-reference-implementation.md?plain=1#L28

Signing drivers in the repo today are the internal signer, the participant, BitGo, Blockdaemon, DFNS, Fireblocks and Securosys. None keeps the key on a phone  
https://github.com/canton-network/wallet/tree/198cc0391b/core

Gateway docs tell operators not to use internal signing for valuable assets  
https://github.com/canton-network/wallet/blob/198cc0391b/docs/wallet-gateway/operate/security.mdx?plain=1#L20

Two open issues from DA ask for a way to skip the Gateway's approval screen for a signing provider. PR-2 in the proposal adds that option  
https://github.com/canton-network/wallet/issues/2431  
https://github.com/canton-network/wallet/issues/1516

Forum thread, a team bringing Trezor asked how to reach dApps without building its own wallet. The reply from the Canton Foundation recommended a signing driver for the Wallet Gateway, and Part 1 is that driver for the phone  
https://forum.canton.network/t/9123

Vendor drivers that went into the repo as pull requests (Blockdaemon, DFNS, Securosys, BitGo)  
https://github.com/canton-network/wallet/pull/1041  
https://github.com/canton-network/wallet/pull/1682  
https://github.com/canton-network/wallet/pull/2123  
https://github.com/canton-network/wallet/pull/2163

### Standards and funded tooling

CIP-0103 has mobile as a provider type and lists in-app bridges for mobile applications  
https://github.com/canton-foundation/cips/blob/48dbc8e306/cip-0103/cip-0103.md?plain=1#L235

The dApp SDK's built-in wallet list has one entry, a browser extension  
https://github.com/canton-network/wallet/blob/198cc0391b/sdk/dapp-sdk/src/wallets.json

PartyLayer's grant (Dev Fund #9) includes React Native bindings in Milestone 3, about 1,100 npm downloads of the package in the last 30 days  
https://github.com/canton-foundation/canton-dev-fund/blob/1445524ce8/proposals/2026-02-Cayvox%20Labs-PartyLayer-Wallet-SDK.md?plain=1#L313-L318  
https://www.npmjs.com/package/@partylayer/react-native
