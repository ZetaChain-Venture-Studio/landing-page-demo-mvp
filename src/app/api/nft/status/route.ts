import { NextRequest, NextResponse } from 'next/server';
import { isNFTConfigured, getNFTInfo, getTotalSupply, hasMinted } from '@/lib/nft';

// GET /api/nft/status - Check NFT configuration and optionally wallet status
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  const configured = isNFTConfigured();
  const contractAddress = process.env.POP_AI_NFT_ADDRESS || null;

  const response: Record<string, unknown> = {
    configured,
    contractAddress,
    network: process.env.ZETACHAIN_TESTNET === 'true' ? 'testnet' : 'mainnet',
  };

  if (configured) {
    try {
      response.totalSupply = await getTotalSupply();
    } catch (e) {
      response.totalSupplyError = String(e);
    }
  }

  if (walletAddress) {
    try {
      const info = await getNFTInfo(walletAddress);
      response.walletInfo = info;
    } catch (e) {
      response.walletError = String(e);
    }
  }

  return NextResponse.json(response);
}
