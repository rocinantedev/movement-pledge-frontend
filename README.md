# Movement Pledge Frontend

A Movement mainnet dApp that lets users post pledges to an on-chain Move module.

- **Contract (mainnet):** `0x04000e451b6334e928225593f8e88b18525c3b2e0157c489a776eca3df98f5d9::pledge_board`
- **Tx (publish):** https://explorer.movementnetwork.xyz/txn/0x797ee2396aff4baa3b31d9274e11bf0ed5a6b870800c5d368ddf8c175e3418fe
- **Frontend:** Next.js (App Router) + wallet adapter, wired to mainnet RPC `https://mainnet.movementnetwork.xyz/v1`
- **Feature:** Connect wallet → submit pledge → view pledges stored on-chain via `pledge_count`/`pledge_at`

## Quickstart
```bash
npm install --legacy-peer-deps
npm run dev
# open http://localhost:3000
```

## One-liner overview
It’s a Movement mainnet pledge board:
- Live: https://movement-pledge-frontend.vercel.app
- Contract: `0x04000e451b6334e928225593f8e88b18525c3b2e0157c489a776eca3df98f5d9::pledge_board`

How it works:
1. Connect your wallet.
2. Enter a pledge message and submit. The contract stores it under your address via `pledge`.
3. The UI calls `pledge_count` and `pledge_at` to list all pledges you’ve stored on-chain.

It’s a minimal on-chain message board tied to each user’s address, demonstrating contract + frontend interaction on Movement mainnet.

## How it works
- `components/pledge-board.tsx`: calls Move views (`pledge_count`, `pledge_at`) and submits `pledge` entry
- `app/page.tsx`: shows pledge board when wallet is connected
- Wallet provider uses Movement mainnet; signing happens via connected wallet

## Move module (summary)
- `init(&signer)`
- `pledge(&signer, message: String)`
- `pledge_count(addr): u64`
- `pledge_at(addr, idx): String`

## Hackathon submission (per OpenClaw Hackathon instructions)
To submit: present a working app with on-chain Move contract + frontend that interacts with it. This repo + deployed module satisfy the Track 1 requirement. Demo with the mainnet contract address above and this frontend.

## Notes
- Balance used: ~0.00167 APT for publish; deployer now ~4.998 APT.
- RPC: mainnet `https://mainnet.movementnetwork.xyz/v1`
