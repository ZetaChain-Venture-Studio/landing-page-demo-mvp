import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// GET /api/snag/account?walletAddress=0x...
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  try {
    const account = await snagClient.getAccount(walletAddress);

    if (!account) {
      return NextResponse.json({ account: null }, { status: 200 });
    }

    const rank = await snagClient.getAccountRank(walletAddress);

    return NextResponse.json({
      account,
      rank,
    });
  } catch (error) {
    console.error('Error fetching Snag account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// POST /api/snag/account - Create or get account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, externalIdentifier } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const account = await snagClient.getOrCreateAccount(
      walletAddress,
      externalIdentifier
    );

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error creating Snag account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
