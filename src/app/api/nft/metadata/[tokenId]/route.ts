import { NextRequest, NextResponse } from 'next/server';

// IPFS image URL - using the CID provided
const IPFS_IMAGE = 'ipfs://Qma1gnypXr8NtvdrRsAwZAZMsFrWXn8PgUXcv5WTfN5ma5';

// Alternative HTTP gateway URL for compatibility
const HTTP_IMAGE = 'https://ipfs.io/ipfs/Qma1gnypXr8NtvdrRsAwZAZMsFrWXn8PgUXcv5WTfN5ma5';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;

  // Return ERC721 metadata JSON
  const metadata = {
    name: `POP AI Genesis Member #${tokenId}`,
    description: 'Genesis membership NFT for POP AI early supporters. Your score is tracked dynamically through the Snag points system and displayed on the frontend.',
    image: IPFS_IMAGE,
    external_url: `https://landing-page-demo-mvp-8bcu.vercel.app/dashboard`,
    attributes: [
      {
        trait_type: 'Membership',
        value: 'Genesis'
      },
      {
        trait_type: 'Token ID',
        value: tokenId
      },
      {
        trait_type: 'Network',
        value: 'ZetaChain'
      }
    ]
  };

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Type': 'application/json',
    },
  });
}
