import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';
import { getDb } from '@/lib/db';

// Snag rule ID for staking task
const STAKING_RULE_ID = '6c275439-581a-4126-9467-4ec5ce813a69';

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

    // Try to get/create Snag account (but don't fail if it doesn't work)
    let account = null;
    try {
      account = await snagClient.getOrCreateAccount(walletAddress);
      console.log('[Staking API] Snag account:', account?.id || 'FAILED TO CREATE');
    } catch (snagErr) {
      console.error('[Staking API] Snag account error:', snagErr);
    }

    // ALWAYS save to database first
    const db = getDb();
    let dbSaved = false;
    let dbUser = null;

    if (db) {
      try {
        dbUser = await db.user.upsert({
          where: { walletAddress },
          create: {
            email: `wallet_${walletAddress}@anuma.ai`,
            walletAddress,
            snagUserId: account?.id || null,
            totalPoints: points,
          },
          update: {
            totalPoints: { increment: points },
            snagUserId: account?.id || undefined,
          },
        });

        await db.pointsHistory.create({
          data: {
            userId: dbUser.id,
            amount: points,
            type: 'staking',
            description: `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`,
          },
        });

        dbSaved = true;
        console.log('[Staking API] Saved to database:', dbUser.id, 'total points:', dbUser.totalPoints + points);
      } catch (dbError) {
        console.error('[Staking API] Database error:', dbError);
      }
    }

    // Now try Snag integration (optional - don't fail if it doesn't work)
    let snagSuccess = false;
    if (account) {
      try {
        await snagClient.completeRule(account.id, STAKING_RULE_ID);
        await snagClient.awardPoints(
          walletAddress,
          points,
          STAKING_RULE_ID,
          `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`
        );
        snagSuccess = true;
        console.log('[Staking API] Snag points awarded');
      } catch (snagError) {
        console.error('[Staking API] Snag award error:', snagError);
      }
    }

    return NextResponse.json({
      success: true,
      points,
      dbSaved,
      snagSuccess,
      userId: dbUser?.id,
      totalPoints: dbUser ? dbUser.totalPoints + points : points,
    });
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
