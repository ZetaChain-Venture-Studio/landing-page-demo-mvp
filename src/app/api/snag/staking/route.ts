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

    // Ensure user has an account first
    const account = await snagClient.getOrCreateAccount(walletAddress);

    if (!account) {
      return NextResponse.json(
        { error: 'Failed to get or create Snag account' },
        { status: 500 }
      );
    }

    // Award points for staking via rule completion
    try {
      // Complete the staking rule to award points
      const success = await snagClient.completeRule(account.id, STAKING_RULE_ID);

      if (!success) {
        throw new Error('Failed to complete staking rule');
      }

      console.log('[Staking API] Rule completed, points awarded');

      // Also try to award additional points based on amount staked
      const transaction = await snagClient.awardPoints(
        walletAddress,
        points,
        STAKING_RULE_ID,
        `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`
      );

      console.log('[Staking API] Points awarded:', transaction);

      // Save to database
      const db = getDb();
      if (db) {
        try {
          // Find or create user
          const user = await db.user.upsert({
            where: { walletAddress },
            create: {
              email: `wallet_${walletAddress}@anuma.ai`,
              walletAddress,
              snagUserId: account.id,
              totalPoints: points,
            },
            update: {
              totalPoints: { increment: points },
            },
          });

          // Record task completion
          await db.taskCompletion.create({
            data: {
              userId: user.id,
              taskId: STAKING_RULE_ID,
              taskName: 'Stake ZETA',
              taskType: 'staking',
              pointsEarned: points,
            },
          });

          // Record points history
          await db.pointsHistory.create({
            data: {
              userId: user.id,
              amount: points,
              type: 'staking',
              description: `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`,
            },
          });

          console.log('[Staking API] Saved to database for user:', user.id);
        } catch (dbError) {
          console.error('[Staking API] Database error:', dbError);
          // Don't fail if DB save fails
        }
      }

      return NextResponse.json({
        success: true,
        points,
        transaction,
        dbSaved: !!db,
      });
    } catch (awardError) {
      // If awardPoints fails, still save to database
      console.log('[Staking API] Snag awardPoints failed:', awardError);
      console.log('[Staking API] Saving to database anyway...');

      // Save to database even if Snag fails
      const db = getDb();
      let dbSaved = false;
      if (db) {
        try {
          const user = await db.user.upsert({
            where: { walletAddress },
            create: {
              email: `wallet_${walletAddress}@anuma.ai`,
              walletAddress,
              snagUserId: account?.id || null,
              totalPoints: points,
            },
            update: {
              totalPoints: { increment: points },
            },
          });

          await db.pointsHistory.create({
            data: {
              userId: user.id,
              amount: points,
              type: 'staking',
              description: `Staked ${amount} ZETA${txHash ? ` (tx: ${txHash.slice(0, 10)}...)` : ''}`,
            },
          });

          dbSaved = true;
          console.log('[Staking API] Saved to database (Snag failed):', user.id);
        } catch (dbErr) {
          console.error('[Staking API] Database error in catch:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        points,
        snagIntegration: false,
        dbSaved,
        message: 'Points saved to database. Snag integration failed.',
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
