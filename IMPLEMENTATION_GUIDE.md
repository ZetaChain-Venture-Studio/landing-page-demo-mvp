# POP AI Genesis NFT - Implementation Guide

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. User signs up → Backend mints NFT to their wallet       │
│  2. NFT metadata points to your API                         │
│  3. API returns JSON with IPFS image URL                    │
│  4. User earns points → Snag tracks offchain                │
│  5. Frontend displays NFT image + overlays score from Snag  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**The NFT image is static (on IPFS). The score is dynamic (from Snag API, shown on frontend).**

---

## Step 1: Upload Image to IPFS

1. Go to [Pinata](https://pinata.cloud) or [NFT.Storage](https://nft.storage)
2. Upload your PNG image
3. Get the IPFS URL: `ipfs://Qm.../pop-ai-genesis.png`

---

## Step 2: Deploy Contract to ZetaChain

### 2.1 Setup

```bash
cd pop-ai-nft
npm install
```

### 2.2 Create .env file

```env
PRIVATE_KEY=your_deployer_wallet_private_key
```

### 2.3 Update BASE_URI in scripts/deploy.js

Change this line to your metadata API:
```javascript
const BASE_URI = "https://api.yoursite.com/nft/metadata/";
```

### 2.4 Deploy

```bash
# Testnet first
npm run deploy:testnet

# Then mainnet
npm run deploy:mainnet
```

### 2.5 Set Backend as Minter

After deployment, call `setMinter(YOUR_BACKEND_WALLET)` from the owner wallet.

---

## Step 3: Create Metadata API

Your API endpoint should return JSON like this:

```
GET https://api.yoursite.com/nft/metadata/1
```

Response:
```json
{
  "name": "POP AI Genesis Member #1",
  "description": "Genesis membership for POP AI early supporters.",
  "image": "ipfs://QmYourImageHash/pop-ai-genesis.png",
  "attributes": [
    { "trait_type": "Membership", "value": "Genesis" },
    { "trait_type": "Token ID", "value": "1" }
  ]
}
```

### Example API (Next.js)

```typescript
// app/api/nft/metadata/[tokenId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const IPFS_IMAGE = "ipfs://QmYourImageHash/pop-ai-genesis.png";

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;

  return NextResponse.json({
    name: `POP AI Genesis Member #${tokenId}`,
    description: "Genesis membership for POP AI early supporters.",
    image: IPFS_IMAGE,
    attributes: [
      { trait_type: "Membership", value: "Genesis" },
      { trait_type: "Token ID", value: tokenId }
    ]
  });
}
```

---

## Step 4: Mint NFT on User Signup

### Claude Code Instructions

```
When a user signs up:
1. Call the contract's mint(userWalletAddress) function
2. Create user in Snag for points tracking
3. Award signup bonus points via Snag

The contract address is: [INSERT_AFTER_DEPLOY]
The minter wallet private key is in env: MINTER_PRIVATE_KEY
```

### Backend Code

```typescript
// lib/nft.ts
import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.POP_AI_NFT_ADDRESS!;
const ABI = [
  "function mint(address to) external returns (uint256)",
  "function hasMinted(address wallet) view returns (bool)"
];

const provider = new ethers.JsonRpcProvider("https://zetachain-evm.blockpi.network/v1/rpc/public");
const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY!, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

export async function mintGenesisNFT(userWallet: string) {
  // Check if already minted
  if (await contract.hasMinted(userWallet)) {
    return { success: false, error: "Already minted" };
  }
  
  // Mint
  const tx = await contract.mint(userWallet);
  const receipt = await tx.wait();
  
  return { success: true, txHash: receipt.hash };
}
```

### Signup API Route

```typescript
// app/api/signup/route.ts
import { mintGenesisNFT } from "@/lib/nft";
import { createSnagUser, awardPoints } from "@/lib/snag";

export async function POST(request: Request) {
  const { walletAddress } = await request.json();
  
  // 1. Mint NFT
  const mintResult = await mintGenesisNFT(walletAddress);
  
  // 2. Create in Snag
  await createSnagUser(walletAddress);
  
  // 3. Award signup points
  await awardPoints(walletAddress, 100, "SIGNUP_RULE_ID");
  
  return Response.json({ success: true, ...mintResult });
}
```

---

## Step 5: Display Score on Frontend

The score comes from Snag API and is overlaid on the NFT image in the UI.

```tsx
// components/GenesisNFT.tsx
"use client";
import { useEffect, useState } from "react";

export function GenesisNFT({ wallet }: { wallet: string }) {
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    fetch(`/api/user/points?wallet=${wallet}`)
      .then(res => res.json())
      .then(data => setPoints(data.points));
  }, [wallet]);

  return (
    <div className="relative w-[400px] h-[250px]">
      {/* NFT Image */}
      <img 
        src="/pop-ai-genesis.png" 
        alt="Genesis NFT"
        className="w-full h-full object-cover rounded-xl"
      />
      
      {/* Score Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl font-black text-white drop-shadow-lg">
          {points.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
```

### Points API Route

```typescript
// app/api/user/points/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  
  const response = await fetch(
    `https://api.snagsolutions.io/api/loyalty/accounts?walletAddress=${wallet}`,
    { headers: { "x-api-key": process.env.SNAG_API_KEY! } }
  );
  
  const data = await response.json();
  return Response.json({ points: data.points || 0 });
}
```

---

## Contract Functions Reference

| Function | Access | Description |
|----------|--------|-------------|
| `mint(address to)` | Minter only | Mint NFT to user |
| `batchMint(address[])` | Minter only | Mint to multiple users |
| `hasMinted(address)` | Public | Check if wallet has NFT |
| `walletToToken(address)` | Public | Get token ID for wallet |
| `setMinter(address)` | Owner only | Set minter address |
| `setBaseURI(string)` | Owner only | Update metadata URL |

---

## Environment Variables

```env
# Contract
POP_AI_NFT_ADDRESS=0x...     # After deployment
MINTER_PRIVATE_KEY=...        # Backend wallet

# Snag
SNAG_API_KEY=...
SNAG_WEBSITE_ID=...
SNAG_SIGNUP_RULE_ID=...       # External rule for signup bonus
```

---

## Deployment Checklist

- [ ] Upload image to IPFS
- [ ] Update BASE_URI in deploy script
- [ ] Deploy to testnet, test minting
- [ ] Deploy to mainnet
- [ ] Set minter to backend wallet
- [ ] Create metadata API endpoint
- [ ] Integrate mint in signup flow
- [ ] Setup Snag with external rules
- [ ] Build frontend with score overlay
