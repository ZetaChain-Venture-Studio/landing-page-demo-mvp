import { NextRequest, NextResponse } from 'next/server';
import { mintGenesisNFT, isNFTConfigured, getNFTInfo } from '@/lib/nft';

// POST /api/nft/mint - Mint NFT to user wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Check if NFT minting is configured
    if (!isNFTConfigured()) {
      console.log('[Mint API] NFT not configured, skipping mint');
      return NextResponse.json({
        success: false,
        error: 'NFT minting not configured',
        configured: false,
      });
    }

    console.log('[Mint API] Minting NFT to:', walletAddress);

    // Mint the NFT
    const result = await mintGenesisNFT(walletAddress);

    if (result.success) {
      console.log('[Mint API] Mint successful:', result);
      return NextResponse.json({
        success: true,
        tokenId: result.tokenId,
        txHash: result.txHash,
        alreadyMinted: result.error === 'Already minted',
      });
    } else {
      console.error('[Mint API] Mint failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Mint API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mint NFT', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/nft/mint?walletAddress=0x... - Check NFT status
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  try {
    const info = await getNFTInfo(walletAddress);
    return NextResponse.json(info);
  } catch (error) {
    console.error('[Mint API] Error getting NFT info:', error);
    return NextResponse.json(
      { error: 'Failed to get NFT info' },
      { status: 500 }
    );
  }
}
