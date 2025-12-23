import { NextRequest, NextResponse } from 'next/server';
import { snagClient } from '@/lib/snag';

// GET /api/snag/test?wallet=0x... - Test Snag integration for a wallet
export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({
      error: 'wallet query param required',
      usage: '/api/snag/test?wallet=0x...'
    }, { status: 400 });
  }

  try {
    console.log('[Snag Test] Testing for wallet:', walletAddress);

    // 1. Get or create account
    const account = await snagClient.getOrCreateAccount(walletAddress);
    console.log('[Snag Test] Account:', account);

    // 2. Get all rule statuses if we have an account
    let ruleStatuses: unknown[] = [];
    if (account) {
      ruleStatuses = await snagClient.getAllRuleStatuses(account.id);
      console.log('[Snag Test] Rule statuses:', ruleStatuses);
    }

    // 3. Get available rules
    const rules = await snagClient.getRules();
    console.log('[Snag Test] Available rules:', rules.length);

    // 4. Get transactions
    const transactions = await snagClient.getTransactions(walletAddress);
    console.log('[Snag Test] Transactions:', transactions.length);

    // 5. Get leaderboard position
    let rank = { position: 0, total: 0 };
    if (account) {
      try {
        rank = await snagClient.getAccountRank(walletAddress);
      } catch (e) {
        console.log('[Snag Test] Could not get rank:', e);
      }
    }

    return NextResponse.json({
      success: true,
      wallet: walletAddress,
      account: account ? {
        id: account.id,
        points: account.points,
        createdAt: account.createdAt,
      } : null,
      rank,
      rules: rules.map(r => ({
        id: r.id,
        name: r.name,
        points: r.amount,
        isActive: r.isActive,
      })),
      ruleStatuses: ruleStatuses,
      recentTransactions: transactions.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Snag Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      wallet: walletAddress,
    }, { status: 500 });
  }
}
