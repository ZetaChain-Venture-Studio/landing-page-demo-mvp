import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// POST /api/snag/staking - Record a staking event and award points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, txHash } = body;

    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: 'walletAddress and amount are required' },
        { status: 400 }
      );
    }

    const points = Math.floor(parseFloat(amount)); // 1 point per ZETA

    if (points <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log('[Staking API] Recording stake:', { walletAddress, amount, points, txHash });

    // Ensure user has an account first
    const account = await snagClient.getOrCreateAccount(walletAddress);

    if (!account) {
      return NextResponse.json(
        { error: 'Failed to get or create Snag account' },
        { status: 500 }
      );
    }

    // Award points for staking
    // Note: If you have a specific staking rule ID in Snag, replace 'staking' with the actual rule ID
    try {
      const transaction = await snagClient.awardPoints(
        walletAddress,
        points,
        'staking', // This should be your staking rule ID from Snag dashboard
        `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`
      );

      console.log('[Staking API] Points awarded:', transaction);

      return NextResponse.json({
        success: true,
        points,
        transaction,
      });
    } catch (awardError) {
      // If awardPoints fails (rule might not exist), try using completeRule
      console.log('[Staking API] awardPoints failed, this is expected if no staking rule exists yet');
      console.log('[Staking API] To enable Snag tracking, create an External Rule in Snag dashboard');

      // Return success anyway - points are tracked locally in the frontend
      return NextResponse.json({
        success: true,
        points,
        snagIntegration: false,
        message: 'Points tracked locally. Create a staking rule in Snag to enable backend tracking.',
      });
    }
  } catch (error) {
    console.error('[Staking API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record staking', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/snag/staking - External Rule endpoint for Snag to verify staking
// Snag will call this endpoint to check if a user has staked
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('walletAddress');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!walletAddress && !userId) {
    return NextResponse.json(
      { error: 'walletAddress or userId is required' },
      { status: 400 }
    );
  }

  try {
    // For External Rule verification, Snag expects a response indicating completion
    // In production, you would check your database for staking records
    // For now, we return the account info which Snag can use

    const account = walletAddress
      ? await snagClient.getAccount(walletAddress)
      : null;

    // Return format expected by Snag External Rules
    return NextResponse.json({
      completed: false, // Will be true if user has staking records in your DB
      userId: account?.id || userId,
      walletAddress,
      message: 'Connect to database to track staking completion status',
    });
  } catch (error) {
    console.error('[Staking API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to check staking status' },
      { status: 500 }
    );
  }
}
